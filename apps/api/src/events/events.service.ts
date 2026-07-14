import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateEventInput,
  CursorQuery,
  Event as EventEntity,
  Page,
} from "@repo/library";

import { toUserEntity } from "../common/mappers";
import { cursorArgs, slicePage } from "../common/pagination";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    creator: true;
    attendees: { select: { id: true } };
    _count: { select: { attendees: true } };
  };
}>;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateEventInput): Promise<EventEntity> {
    const event = await this.prisma.event.create({
      data: {
        creatorId: userId,
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        coverUrl: input.coverUrl || null,
        startsAt: new Date(input.startsAt),
      },
      include: this.include(userId),
    });

    return this.toEventEntity(event);
  }

  async list(userId: string, query: CursorQuery): Promise<Page<EventEntity>> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const rows = await this.prisma.event.findMany({
      where: { startsAt: { gte: startOfToday } },
      include: this.include(userId),
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      ...cursorArgs(query),
    });

    const { items, nextCursor } = slicePage(rows, query.limit);
    return {
      items: items.map((row) => this.toEventEntity(row)),
      nextCursor,
    };
  }

  async setAttendance(
    userId: string,
    eventId: string,
    going: boolean,
  ): Promise<EventEntity> {
    await this.getOrThrow(eventId);

    if (going) {
      await this.prisma.eventAttendee.upsert({
        where: { eventId_userId: { eventId, userId } },
        create: { eventId, userId },
        update: {},
      });
    } else {
      await this.prisma.eventAttendee.deleteMany({ where: { eventId, userId } });
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: this.include(userId),
    });
    if (!event) throw new NotFoundException("Event not found");

    return this.toEventEntity(event);
  }

  private async getOrThrow(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException("Event not found");
    return event;
  }

  private include(userId: string) {
    return {
      creator: true,
      attendees: { where: { userId }, select: { id: true } },
      _count: { select: { attendees: true } },
    } satisfies Prisma.EventInclude;
  }

  private toEventEntity(event: EventWithRelations): EventEntity {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      coverUrl: event.coverUrl,
      startsAt: event.startsAt.toISOString(),
      creator: toUserEntity(event.creator),
      goingCount: event._count.attendees,
      viewerGoing: event.attendees.length > 0,
      createdAt: event.createdAt.toISOString(),
    };
  }
}
