import type { ReactionType } from "@repo/library";

export interface Reactable {
  likeCount: number;
  reactionCounts: Partial<Record<ReactionType, number>>;
  viewerReaction: ReactionType | null;
}

export function applyReaction<T extends Reactable>(
  item: T,
  reaction: ReactionType | null,
): T {
  const previous = item.viewerReaction;
  if (previous === reaction) return item;

  const reactionCounts = { ...item.reactionCounts };
  if (previous) {
    const next = (reactionCounts[previous] ?? 1) - 1;
    if (next <= 0) delete reactionCounts[previous];
    else reactionCounts[previous] = next;
  }
  if (reaction) {
    reactionCounts[reaction] = (reactionCounts[reaction] ?? 0) + 1;
  }

  const likeCount =
    item.likeCount + (previous && !reaction ? -1 : !previous && reaction ? 1 : 0);

  return { ...item, viewerReaction: reaction, reactionCounts, likeCount };
}
