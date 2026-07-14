import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  PostVisibility,
  ReactionType,
  type CreatePostInput,
  type CursorQuery,
  type Page,
  type Post as PostEntity,
  type Reactor,
  type ReactorQuery,
  type UpdatePostInput,
} from "@repo/library";

import { toUserEntity } from "../common/mappers";
import { cursorArgs, slicePage } from "../common/pagination";
import { reactionCountMap, type ReactionCounts } from "../common/reactions";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { isPostVisibleTo, postVisibleWhere } from "./post-visibility";

type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: { select: { id: true; type: true } };
    savedBy: { select: { id: true } };
  };
}>;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(userId: string, input: CreatePostInput): Promise<PostEntity> {
    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        content: input.content,
        imageUrls: input.imageUrls,
        visibility: input.visibility,
      },
      include: this.include(userId),
    });

    return this.oneToEntity(post);
  }

  async feed(userId: string, query: CursorQuery): Promise<Page<PostEntity>> {
    const rows = await this.prisma.post.findMany({
      where: postVisibleWhere(userId),
      include: this.include(userId),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...cursorArgs(query),
    });

    const { items, nextCursor } = slicePage(rows, query.limit);
    const counts = await this.reactionCounts(items.map((row) => row.id));

    return {
      items: items.map((row) => this.toPostEntity(row, counts.get(row.id) ?? {})),
      nextCursor,
    };
  }

  async findOne(userId: string, postId: string): Promise<PostEntity> {
    return this.oneToEntity(await this.fetchVisible(userId, postId));
  }

  async saved(userId: string, query: CursorQuery): Promise<Page<PostEntity>> {
    const rows = await this.prisma.savedPost.findMany({
      where: { userId, post: postVisibleWhere(userId) },
      include: { post: { include: this.include(userId) } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...cursorArgs(query),
    });

    const { items, nextCursor } = slicePage(rows, query.limit);
    const counts = await this.reactionCounts(items.map((row) => row.postId));

    return {
      items: items.map((row) =>
        this.toPostEntity(row.post, counts.get(row.postId) ?? {}),
      ),
      nextCursor,
    };
  }

  async save(userId: string, postId: string): Promise<PostEntity> {
    const post = await this.fetchVisible(userId, postId);
    await this.prisma.savedPost.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId },
      update: {},
    });
    return { ...(await this.oneToEntity(post)), viewerSaved: true };
  }

  async unsave(userId: string, postId: string): Promise<PostEntity> {
    const post = await this.fetchVisible(userId, postId);
    await this.prisma.savedPost.deleteMany({ where: { userId, postId } });
    return { ...(await this.oneToEntity(post)), viewerSaved: false };
  }

  async reactors(
    userId: string,
    postId: string,
    query: ReactorQuery,
  ): Promise<Page<Reactor>> {
    await this.getVisibleOrThrow(userId, postId);

    const rows = await this.prisma.postLike.findMany({
      where: { postId, ...(query.type ? { type: query.type } : {}) },
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
    postId: string,
    input: UpdatePostInput,
  ): Promise<PostEntity> {
    await this.getOwnedOrThrow(userId, postId);

    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        content: input.content,
        imageUrls: input.imageUrls,
        visibility: input.visibility,
      },
      include: this.include(userId),
    });

    return this.oneToEntity(post);
  }

  async remove(userId: string, postId: string): Promise<void> {
    await this.getOwnedOrThrow(userId, postId);
    await this.prisma.post.delete({ where: { id: postId } });
  }

  async react(
    userId: string,
    postId: string,
    type: ReactionType,
  ): Promise<PostEntity> {
    await this.getVisibleOrThrow(userId, postId);

    await this.prisma.$transaction(async (tx) => {
      await tx.postLike.upsert({
        where: { postId_userId: { postId, userId } },
        create: { postId, userId, type },
        update: { type },
      });
      const likeCount = await tx.postLike.count({ where: { postId } });
      await tx.post.update({ where: { id: postId }, data: { likeCount } });
    });

    return this.reactionToEntity(userId, postId);
  }

  async unreact(userId: string, postId: string): Promise<PostEntity> {
    await this.getVisibleOrThrow(userId, postId);

    await this.prisma.$transaction(async (tx) => {
      await tx.postLike.deleteMany({ where: { postId, userId } });
      const likeCount = await tx.postLike.count({ where: { postId } });
      await tx.post.update({ where: { id: postId }, data: { likeCount } });
    });

    return this.reactionToEntity(userId, postId);
  }

  private async reactionToEntity(
    userId: string,
    postId: string,
  ): Promise<PostEntity> {
    const post = await this.oneToEntity(await this.fetchVisible(userId, postId));
    if (post.visibility === PostVisibility.PUBLIC) {
      this.realtime.publish("post:reaction", {
        postId: post.id,
        likeCount: post.likeCount,
        reactionCounts: post.reactionCounts,
      });
    }
    return post;
  }

  private include(userId: string) {
    return {
      author: true,
      likes: { where: { userId }, select: { id: true, type: true } },
      savedBy: { where: { userId }, select: { id: true } },
    } satisfies Prisma.PostInclude;
  }

  private async reactionCounts(
    postIds: string[],
  ): Promise<Map<string, ReactionCounts>> {
    if (postIds.length === 0) return new Map();

    const groups = await this.prisma.postLike.groupBy({
      by: ["postId", "type"],
      where: { postId: { in: postIds } },
      _count: { _all: true },
    });

    return reactionCountMap(
      groups.map((group) => ({
        id: group.postId,
        type: group.type,
        count: group._count._all,
      })),
    );
  }

  private async oneToEntity(post: PostWithRelations): Promise<PostEntity> {
    const counts = await this.reactionCounts([post.id]);
    return this.toPostEntity(post, counts.get(post.id) ?? {});
  }

  private async fetchVisible(
    userId: string,
    postId: string,
  ): Promise<PostWithRelations> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: this.include(userId),
    });
    if (!post || !isPostVisibleTo(post, userId)) {
      throw new NotFoundException("Post not found");
    }
    return post;
  }

  private async getOwnedOrThrow(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException("Post not found");
    if (post.authorId !== userId) {
      throw new ForbiddenException("You can only modify your own posts");
    }
    return post;
  }

  private async getVisibleOrThrow(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || !isPostVisibleTo(post, userId)) {
      throw new NotFoundException("Post not found");
    }
    return post;
  }

  private toPostEntity(
    post: PostWithRelations,
    reactionCounts: ReactionCounts,
  ): PostEntity {
    return {
      id: post.id,
      content: post.content,
      imageUrls: post.imageUrls,
      visibility: post.visibility as PostVisibility,
      author: toUserEntity(post.author),
      likeCount: post.likeCount,
      reactionCounts,
      viewerReaction: (post.likes[0]?.type as ReactionType | undefined) ?? null,
      viewerSaved: post.savedBy.length > 0,
      commentCount: post.commentCount,
      shareCount: post.shareCount,
      createdAt: post.createdAt.toISOString(),
    };
  }
}
