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
  type User as UserEntity,
} from "@repo/library";

import { FriendshipStatus, type User } from "../generated/prisma/client";
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
        take: query.limit + 1,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      this.prisma.friendship.count({ where }),
    ]);

    return this.toPage(rows, query.limit, total, (row) =>
      this.toMember(
        row.requesterId === userId ? row.addressee : row.requester,
        FriendStatus.FRIENDS,
      ),
    );
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
        take: query.limit + 1,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      this.prisma.friendship.count({ where }),
    ]);

    const status = incoming
      ? FriendStatus.REQUEST_RECEIVED
      : FriendStatus.REQUEST_SENT;

    return this.toPage(rows, query.limit, total, (row) =>
      this.toMember(incoming ? row.requester : row.addressee, status),
    );
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
      return this.toMember(target, FriendStatus.FRIENDS);
    }

    await this.prisma.friendship.create({
      data: { requesterId: userId, addresseeId: targetId },
    });

    return this.toMember(target, FriendStatus.REQUEST_SENT);
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

    return this.toMember(request.requester, FriendStatus.FRIENDS);
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

  private toPage<T extends { id: string }>(
    rows: T[],
    limit: number,
    total: number,
    map: (row: T) => Member,
  ): Page<Member> {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.map(map),
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
      total,
    };
  }

  private toMember(user: User, friendStatus: FriendStatus): Member {
    return { ...this.toUserEntity(user), friendStatus };
  }

  private toUserEntity(user: User): UserEntity {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
