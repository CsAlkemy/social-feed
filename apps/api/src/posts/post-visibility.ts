import { PostVisibility } from "@repo/library";

import type { Prisma } from "../generated/prisma/client";

export function postVisibleWhere(userId: string): Prisma.PostWhereInput {
  return { OR: [{ visibility: PostVisibility.PUBLIC }, { authorId: userId }] };
}

export function isPostVisibleTo(
  post: { visibility: string; authorId: string },
  userId: string,
): boolean {
  return post.visibility === PostVisibility.PUBLIC || post.authorId === userId;
}
