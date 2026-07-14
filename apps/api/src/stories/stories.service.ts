import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  type CreateStoryInput,
  type CursorQuery,
  type Page,
  type Story as StoryEntity,
  type StoryGroup,
  type StoryViewer,
} from "@repo/library";

import { toUserEntity } from "../common/mappers";
import { cursorArgs, slicePage } from "../common/pagination";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

type StoryWithRelations = Prisma.StoryGetPayload<{
  include: { author: true; views: { select: { id: true } } };
}>;

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateStoryInput): Promise<StoryEntity> {
    const story = await this.prisma.story.create({
      data: {
        authorId: userId,
        imageUrl: input.imageUrl,
        caption: input.caption ?? null,
        expiresAt: new Date(Date.now() + STORY_TTL_MS),
      },
      include: this.include(userId),
    });

    return this.toEntity(story, 0);
  }

  async feed(userId: string): Promise<StoryGroup[]> {
    const rows = await this.prisma.story.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: this.include(userId),
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    const counts = await this.viewerCounts(rows.map((row) => row.id));
    const groups = new Map<string, StoryGroup>();

    for (const row of rows) {
      const story = this.toEntity(row, counts.get(row.id) ?? 0);
      const group = groups.get(row.authorId);
      if (group) {
        group.stories.push(story);
        group.hasUnseen ||= !story.viewed;
      } else {
        groups.set(row.authorId, {
          author: story.author,
          stories: [story],
          hasUnseen: !story.viewed,
        });
      }
    }

    return [...groups.values()].sort((a, b) => {
      if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
      return this.latestAt(b) - this.latestAt(a);
    });
  }

  async view(userId: string, storyId: string): Promise<StoryEntity> {
    const story = await this.getActiveOrThrow(storyId);

    if (story.authorId !== userId) {
      await this.prisma.storyView.upsert({
        where: { storyId_viewerId: { storyId, viewerId: userId } },
        create: { storyId, viewerId: userId },
        update: {},
      });
    }

    const updated = await this.prisma.story.findUniqueOrThrow({
      where: { id: storyId },
      include: this.include(userId),
    });
    const counts = await this.viewerCounts([storyId]);
    return this.toEntity(updated, counts.get(storyId) ?? 0);
  }

  async viewers(
    userId: string,
    storyId: string,
    query: CursorQuery,
  ): Promise<Page<StoryViewer>> {
    await this.getOwnedOrThrow(userId, storyId);

    const rows = await this.prisma.storyView.findMany({
      where: { storyId },
      include: { viewer: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...cursorArgs(query),
    });

    const { items, nextCursor } = slicePage(rows, query.limit);
    return {
      items: items.map((row) => ({
        user: toUserEntity(row.viewer),
        viewedAt: row.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  async remove(userId: string, storyId: string): Promise<void> {
    await this.getOwnedOrThrow(userId, storyId);
    await this.prisma.story.delete({ where: { id: storyId } });
  }

  private include(userId: string) {
    return {
      author: true,
      views: { where: { viewerId: userId }, select: { id: true } },
    } satisfies Prisma.StoryInclude;
  }

  private latestAt(group: StoryGroup): number {
    return new Date(group.stories[group.stories.length - 1]!.createdAt).getTime();
  }

  private async viewerCounts(storyIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (storyIds.length === 0) return map;

    const groups = await this.prisma.storyView.groupBy({
      by: ["storyId"],
      where: { storyId: { in: storyIds } },
      _count: { _all: true },
    });

    for (const group of groups) map.set(group.storyId, group._count._all);
    return map;
  }

  private async getActiveOrThrow(storyId: string) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } });
    if (!story || story.expiresAt <= new Date()) {
      throw new NotFoundException("Story not found");
    }
    return story;
  }

  private async getOwnedOrThrow(userId: string, storyId: string) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } });
    if (!story) throw new NotFoundException("Story not found");
    if (story.authorId !== userId) {
      throw new ForbiddenException("You can only manage your own stories");
    }
    return story;
  }

  private toEntity(story: StoryWithRelations, viewerCount: number): StoryEntity {
    return {
      id: story.id,
      author: toUserEntity(story.author),
      imageUrl: story.imageUrl,
      caption: story.caption,
      viewed: story.views.length > 0,
      viewerCount,
      createdAt: story.createdAt.toISOString(),
      expiresAt: story.expiresAt.toISOString(),
    };
  }
}
