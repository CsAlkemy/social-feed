import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  PostVisibility,
  ReactionType,
  type Comment as CommentEntity,
  type CreateCommentInput,
  type CursorQuery,
  type Page,
  type Reactor,
  type ReactorQuery,
  type UpdateCommentInput,
} from "@repo/library";

import { toUserEntity } from "../common/mappers";
import { cursorArgs, slicePage } from "../common/pagination";
import { reactionCountMap, type ReactionCounts } from "../common/reactions";
import { Prisma } from "../generated/prisma/client";
import { isPostVisibleTo } from "../posts/post-visibility";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";

type CommentWithRelations = Prisma.CommentGetPayload<{
  include: { author: true; likes: { select: { id: true; type: true } } };
}>;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async listForPost(
    userId: string,
    postId: string,
    query: CursorQuery,
  ): Promise<Page<CommentEntity>> {
    await this.getVisiblePostOrThrow(userId, postId);
    return this.list(userId, { postId, parentId: null }, query);
  }

  async listReplies(
    userId: string,
    commentId: string,
    query: CursorQuery,
  ): Promise<Page<CommentEntity>> {
    const parent = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!parent) throw new NotFoundException("Comment not found");
    await this.getVisiblePostOrThrow(userId, parent.postId);
    return this.list(userId, { parentId: commentId }, query);
  }

  async create(
    userId: string,
    postId: string,
    input: CreateCommentInput,
  ): Promise<CommentEntity> {
    await this.getVisiblePostOrThrow(userId, postId);

    if (input.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: input.parentId },
      });
      if (!parent || parent.postId !== postId) {
        throw new NotFoundException("Parent comment not found");
      }
      if (parent.parentId) {
        throw new BadRequestException("You can only reply to a top-level comment");
      }
    }

    const parentId = input.parentId ?? null;

    const { created, post, parent } = await this.prisma.$transaction(
      async (tx) => {
        const created = await tx.comment.create({
          data: { postId, authorId: userId, parentId, content: input.content },
          include: this.include(userId),
        });
        const post = await tx.post.update({
          where: { id: postId },
          data: { commentCount: { increment: 1 } },
        });
        const parent = parentId
          ? await tx.comment.update({
              where: { id: parentId },
              data: { replyCount: { increment: 1 } },
            })
          : null;
        return { created, post, parent };
      },
    );

    if (post.visibility === PostVisibility.PUBLIC) {
      this.realtime.publish("comment:created", {
        commentId: created.id,
        postId,
        parentId,
        postCommentCount: post.commentCount,
        parentReplyCount: parent?.replyCount ?? null,
      });
    }

    return this.oneToEntity(created);
  }

  async reactors(
    userId: string,
    commentId: string,
    query: ReactorQuery,
  ): Promise<Page<Reactor>> {
    await this.getVisibleCommentOrThrow(userId, commentId);

    const rows = await this.prisma.commentLike.findMany({
      where: { commentId, ...(query.type ? { type: query.type } : {}) },
      include: { user: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...cursorArgs(query),
    });

    const { items, nextCursor } = slicePage(rows, query.limit);
    return {
      items: items.map((row) => ({
        user: toUserEntity(row.user),
        type: row.type as ReactionType,
      })),
      nextCursor,
    };
  }

  async update(
    userId: string,
    commentId: string,
    input: UpdateCommentInput,
  ): Promise<CommentEntity> {
    await this.getOwnedOrThrow(userId, commentId);

    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: input.content },
      include: this.include(userId),
    });

    return this.oneToEntity(comment);
  }

  async remove(userId: string, commentId: string): Promise<void> {
    const comment = await this.getOwnedOrThrow(userId, commentId);
    const removedCount = 1 + comment.replyCount;

    const { post, parent } = await this.prisma.$transaction(async (tx) => {
      await tx.comment.delete({ where: { id: commentId } });
      const post = await tx.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: removedCount } },
      });
      const parent = comment.parentId
        ? await tx.comment.update({
            where: { id: comment.parentId },
            data: { replyCount: { decrement: 1 } },
          })
        : null;
      return { post, parent };
    });

    if (post.visibility === PostVisibility.PUBLIC) {
      this.realtime.publish("comment:deleted", {
        commentId,
        postId: comment.postId,
        parentId: comment.parentId,
        postCommentCount: post.commentCount,
        parentReplyCount: parent?.replyCount ?? null,
      });
    }
  }

  async react(
    userId: string,
    commentId: string,
    type: ReactionType,
  ): Promise<CommentEntity> {
    await this.getVisibleCommentOrThrow(userId, commentId);

    await this.prisma.$transaction(async (tx) => {
      await tx.commentLike.upsert({
        where: { commentId_userId: { commentId, userId } },
        create: { commentId, userId, type },
        update: { type },
      });
      const likeCount = await tx.commentLike.count({ where: { commentId } });
      await tx.comment.update({ where: { id: commentId }, data: { likeCount } });
    });

    return this.reactionToEntity(userId, commentId);
  }

  async unreact(userId: string, commentId: string): Promise<CommentEntity> {
    await this.getVisibleCommentOrThrow(userId, commentId);

    await this.prisma.$transaction(async (tx) => {
      await tx.commentLike.deleteMany({ where: { commentId, userId } });
      const likeCount = await tx.commentLike.count({ where: { commentId } });
      await tx.comment.update({ where: { id: commentId }, data: { likeCount } });
    });

    return this.reactionToEntity(userId, commentId);
  }

  private async reactionToEntity(
    userId: string,
    commentId: string,
  ): Promise<CommentEntity> {
    const row = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { ...this.include(userId), post: { select: { visibility: true } } },
    });
    if (!row) throw new NotFoundException("Comment not found");

    const comment = await this.oneToEntity(row);
    if (row.post.visibility === PostVisibility.PUBLIC) {
      this.realtime.publish("comment:reaction", {
        commentId: comment.id,
        postId: comment.postId,
        parentId: comment.parentId,
        likeCount: comment.likeCount,
        reactionCounts: comment.reactionCounts,
      });
    }
    return comment;
  }

  private async list(
    userId: string,
    where: Prisma.CommentWhereInput,
    query: CursorQuery,
  ): Promise<Page<CommentEntity>> {
    const rows = await this.prisma.comment.findMany({
      where,
      include: this.include(userId),
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      ...cursorArgs(query),
    });

    const { items, nextCursor } = slicePage(rows, query.limit);
    const counts = await this.reactionCounts(items.map((row) => row.id));

    return {
      items: items.map((row) =>
        this.toCommentEntity(row, counts.get(row.id) ?? {}),
      ),
      nextCursor,
    };
  }

  private include(userId: string) {
    return {
      author: true,
      likes: { where: { userId }, select: { id: true, type: true } },
    } satisfies Prisma.CommentInclude;
  }

  private async reactionCounts(
    commentIds: string[],
  ): Promise<Map<string, ReactionCounts>> {
    if (commentIds.length === 0) return new Map();

    const groups = await this.prisma.commentLike.groupBy({
      by: ["commentId", "type"],
      where: { commentId: { in: commentIds } },
      _count: { _all: true },
    });

    return reactionCountMap(
      groups.map((group) => ({
        id: group.commentId,
        type: group.type,
        count: group._count._all,
      })),
    );
  }

  private async oneToEntity(
    comment: CommentWithRelations,
  ): Promise<CommentEntity> {
    const counts = await this.reactionCounts([comment.id]);
    return this.toCommentEntity(comment, counts.get(comment.id) ?? {});
  }

  private async getVisiblePostOrThrow(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || !isPostVisibleTo(post, userId)) {
      throw new NotFoundException("Post not found");
    }
    return post;
  }

  private async getVisibleCommentOrThrow(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException("Comment not found");
    await this.getVisiblePostOrThrow(userId, comment.postId);
    return comment;
  }

  private async getOwnedOrThrow(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.authorId !== userId) {
      throw new ForbiddenException("You can only modify your own comments");
    }
    return comment;
  }

  private toCommentEntity(
    comment: CommentWithRelations,
    reactionCounts: ReactionCounts,
  ): CommentEntity {
    return {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      content: comment.content,
      author: toUserEntity(comment.author),
      likeCount: comment.likeCount,
      reactionCounts,
      viewerReaction:
        (comment.likes[0]?.type as ReactionType | undefined) ?? null,
      replyCount: comment.replyCount,
      createdAt: comment.createdAt.toISOString(),
    };
  }
}
