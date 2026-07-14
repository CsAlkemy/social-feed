import type { ReactionType } from "@repo/library";

export type ReactionCounts = Partial<Record<ReactionType, number>>;

export function reactionCountMap(
  rows: { id: string; type: string; count: number }[],
): Map<string, ReactionCounts> {
  const map = new Map<string, ReactionCounts>();
  for (const row of rows) {
    const entry = map.get(row.id) ?? {};
    entry[row.type as ReactionType] = row.count;
    map.set(row.id, entry);
  }
  return map;
}
