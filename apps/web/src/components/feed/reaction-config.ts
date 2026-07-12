import { ReactionType } from "@repo/library";

export interface ReactionMeta {
  type: ReactionType;
  emoji: string;
  label: string;
  className: string;
}

export const REACTIONS: ReactionMeta[] = [
  { type: ReactionType.LIKE, emoji: "👍", label: "Like", className: "text-primary" },
  { type: ReactionType.LOVE, emoji: "❤️", label: "Love", className: "text-red-500" },
  { type: ReactionType.HAHA, emoji: "😆", label: "Haha", className: "text-amber-500" },
  { type: ReactionType.WOW, emoji: "😮", label: "Wow", className: "text-amber-500" },
  { type: ReactionType.SAD, emoji: "😢", label: "Sad", className: "text-amber-500" },
  { type: ReactionType.ANGRY, emoji: "😡", label: "Angry", className: "text-orange-600" },
];

export const REACTION_BY_TYPE = Object.fromEntries(
  REACTIONS.map((reaction) => [reaction.type, reaction]),
) as Record<ReactionType, ReactionMeta>;

export function topReactions(
  counts: Partial<Record<ReactionType, number>>,
  limit = 3,
): ReactionMeta[] {
  return REACTIONS.filter((reaction) => (counts[reaction.type] ?? 0) > 0)
    .sort((a, b) => (counts[b.type] ?? 0) - (counts[a.type] ?? 0))
    .slice(0, limit);
}
