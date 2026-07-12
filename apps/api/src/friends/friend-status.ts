import { FriendStatus } from "@repo/library";

import { FriendshipStatus, type Friendship } from "../generated/prisma/client";

export function friendStatusOf(
  viewerId: string,
  friendship: Friendship | null | undefined,
): FriendStatus {
  if (!friendship) return FriendStatus.NONE;
  if (friendship.status === FriendshipStatus.ACCEPTED) {
    return FriendStatus.FRIENDS;
  }
  return friendship.requesterId === viewerId
    ? FriendStatus.REQUEST_SENT
    : FriendStatus.REQUEST_RECEIVED;
}

export function friendStatusMap(
  viewerId: string,
  friendships: Friendship[],
): Map<string, FriendStatus> {
  const statuses = new Map<string, FriendStatus>();
  for (const friendship of friendships) {
    const otherId =
      friendship.requesterId === viewerId
        ? friendship.addresseeId
        : friendship.requesterId;
    statuses.set(otherId, friendStatusOf(viewerId, friendship));
  }
  return statuses;
}
