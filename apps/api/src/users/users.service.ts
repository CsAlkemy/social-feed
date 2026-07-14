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

import { toMember, toUserEntity } from "../common/mappers";
import { cursorArgs, slicePage } from "../common/pagination";
import { friendStatusMap } from "../friends/friend-status";
import { FriendshipStatus, Prisma, type User } from "../generated/prisma/client";
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

      return toUserEntity(user);
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
    const rows = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        sentFriendRequests: {
          none: { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
        },
        receivedFriendRequests: {
          none: { requesterId: userId, status: FriendshipStatus.ACCEPTED },
        },
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
      ...cursorArgs(query),
    });

    return this.toMemberPage(userId, rows, query.limit);
  }

  async listSuggestions(
    userId: string,
    query: CursorQuery,
  ): Promise<Page<Member>> {
    const rows = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        sentFriendRequests: { none: { addresseeId: userId } },
        receivedFriendRequests: { none: { requesterId: userId } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...cursorArgs(query),
    });

    const { items, nextCursor } = slicePage(rows, query.limit);
    return {
      items: items.map((user) => toMember(user, FriendStatus.NONE)),
      nextCursor,
    };
  }

  private async toMemberPage(
    userId: string,
    rows: User[],
    limit: number,
  ): Promise<Page<Member>> {
    const { items, nextCursor } = slicePage(rows, limit);
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
        toMember(user, statuses.get(user.id) ?? FriendStatus.NONE),
      ),
      nextCursor,
    };
  }
}
