import type { FriendStatus, Member, User as UserEntity } from "@repo/library";

import type { User } from "../generated/prisma/client";

export function toUserEntity(user: User): UserEntity {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toMember(user: User, friendStatus: FriendStatus): Member {
  return { ...toUserEntity(user), friendStatus };
}
