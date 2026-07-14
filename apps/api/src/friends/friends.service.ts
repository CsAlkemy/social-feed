import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  FriendStatus,
  type CursorQuery,
  type Member,
  type Page,
} from "@repo/library";

import { toMember } from "../common/mappers";
import { cursorArgs, slicePage } from "../common/pagination";
import { FriendshipStatus } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async listFriends(userId: string, query: CursorQuery): Promise<Page<Member>> {
    const where = {
      status: FriendshipStatus.ACCEPTED,
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    };
    const [rows, total] = await Promise.all([
      this.prisma.friendship.findMany({
        where,
        include: { requester: true, addressee: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...cursorArgs(query),
      }),
      this.prisma.friendship.count({ where }),
    ]);

    const { items, nextCursor } = slicePage(rows, query.limit);
    return {
      items: items.map((row) =>
        toMember(
          row.requesterId === userId ? row.addressee : row.requester,
          FriendStatus.FRIENDS,
        ),
      ),
      nextCursor,
      total,
    };
  }

  async listRequests(
    userId: string,
    query: CursorQuery,
    direction: "incoming" | "outgoing",
  ): Promise<Page<Member>> {
    const incoming = direction === "incoming";
    const where = {
      status: FriendshipStatus.PENDING,
      ...(incoming ? { addresseeId: userId } : { requesterId: userId }),
    };
    const [rows, total] = await Promise.all([
      this.prisma.friendship.findMany({
        where,
        include: { requester: true, addressee: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...cursorArgs(query),
      }),
      this.prisma.friendship.count({ where }),
    ]);

    const status = incoming
      ? FriendStatus.REQUEST_RECEIVED
      : FriendStatus.REQUEST_SENT;

    const { items, nextCursor } = slicePage(rows, query.limit);
    return {
      items: items.map((row) =>
        toMember(incoming ? row.requester : row.addressee, status),
      ),
      nextCursor,
      total,
    };
  }

  async sendRequest(userId: string, targetId: string): Promise<Member> {
    if (userId === targetId) {
      throw new BadRequestException("You cannot add yourself as a friend");
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!target) throw new NotFoundException("User not found");

    const existing = await this.findBetween(userId, targetId);

    if (existing?.status === FriendshipStatus.ACCEPTED) {
      throw new ConflictException("You are already friends");
    }

    if (existing) {
      if (existing.requesterId === userId) {
        throw new ConflictException("Friend request already sent");
      }
      await this.prisma.friendship.update({
        where: { id: existing.id },
        data: { status: FriendshipStatus.ACCEPTED },
      });
      return toMember(target, FriendStatus.FRIENDS);
    }

    await this.prisma.friendship.create({
      data: { requesterId: userId, addresseeId: targetId },
    });

    return toMember(target, FriendStatus.REQUEST_SENT);
  }

  async acceptRequest(userId: string, requesterId: string): Promise<Member> {
    const request = await this.prisma.friendship.findFirst({
      where: {
        requesterId,
        addresseeId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: { requester: true },
    });
    if (!request) throw new NotFoundException("Friend request not found");

    await this.prisma.friendship.update({
      where: { id: request.id },
      data: { status: FriendshipStatus.ACCEPTED },
    });

    return toMember(request.requester, FriendStatus.FRIENDS);
  }

  async remove(userId: string, targetId: string): Promise<void> {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: userId },
        ],
      },
    });
  }

  private findBetween(a: string, b: string) {
    return this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: a, addresseeId: b },
          { requesterId: b, addresseeId: a },
        ],
      },
    });
  }
}
