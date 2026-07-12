import type { ReactionType } from "@repo/library";
import { cn } from "@repo/ui";

import { topReactions } from "@/components/feed/reaction-config";

export function ReactionSummary({
  counts,
  total,
  onClick,
  className,
}: {
  counts: Partial<Record<ReactionType, number>>;
  total: number;
  onClick?: () => void;
  className?: string;
}) {
  if (total <= 0) return null;

  const top = topReactions(counts);

  const content = (
    <>
      <span className="flex items-center -space-x-1.5">
        {top.map((reaction) => (
          <span
            key={reaction.type}
            aria-hidden
            className="grid size-[18px] place-items-center rounded-full bg-card text-[11px] leading-none ring-2 ring-card"
          >
            {reaction.emoji}
          </span>
        ))}
      </span>
      <span>{total}</span>
    </>
  );

  const base = "flex items-center gap-1.5 text-xs text-muted-foreground";

  if (!onClick) {
    return <span className={cn(base, className)}>{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="See who reacted"
      className={cn(base, "transition-colors hover:text-foreground", className)}
    >
      {content}
    </button>
  );
}
