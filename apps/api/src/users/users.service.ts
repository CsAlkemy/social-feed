import { ConflictException, Injectable } from "@nestjs/common";
import {
  FriendStatus,
  type CursorQuery,
  type Member,
  type MemberQuery,
  type Page,
  type UpdateProfileInput,
  type User as UserEntity,
} from "@repo/library";

import { FriendshipStatus, Prisma, type User } from "../generated/prisma/client";
import { friendStatusMap } from "../friends/friend-status";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email.toLowerCase(),
          avatarUrl: input.avatarUrl ?? null,
        },
      });

      return this.toUserEntity(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "An account with this email already exists",
        );
      }
      throw error;
    }
  }

  async listMembers(userId: string, query: MemberQuery): Promise<Page<Member>> {
    const search = query.search?.trim();
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });
    const excludeIds = friendships.map((friendship) =>
      friendship.requesterId === userId
        ? friendship.addresseeId
        : friendship.requesterId,
    );

    const rows = await this.prisma.user.findMany({
      where: {
        id: { notIn: [userId, ...excludeIds] },
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    return this.toMemberPage(userId, rows, query.limit);
  }

  async listSuggestions(
    userId: string,
    query: CursorQuery,
  ): Promise<Page<Member>> {
    const related = await this.prisma.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
      select: { requesterId: true, addresseeId: true },
    });

    const excludeIds = new Set<string>([userId]);
    for (const friendship of related) {
      excludeIds.add(friendship.requesterId);
      excludeIds.add(friendship.addresseeId);
    }

    const rows = await this.prisma.user.findMany({
      where: { id: { notIn: [...excludeIds] } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > query.limit;
    const items = hasMore ? rows.slice(0, query.limit) : rows;
    return {
      items: items.map((user) => this.toMember(user, FriendStatus.NONE)),
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    };
  }

  private async toMemberPage(
    userId: string,
    rows: User[],
    limit: number,
  ): Promise<Page<Member>> {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const ids = items.map((user) => user.id);

    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: { in: ids } },
          { addresseeId: userId, requesterId: { in: ids } },
        ],
      },
    });
    const statuses = friendStatusMap(userId, friendships);

    return {
      items: items.map((user) =>
        this.toMember(user, statuses.get(user.id) ?? FriendStatus.NONE),
      ),
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
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
