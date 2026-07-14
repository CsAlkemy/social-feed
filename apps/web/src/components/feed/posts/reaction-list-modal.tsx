import { useEffect, useState } from "react";

import { ReactionType } from "@repo/library";
import { cn, CommonModal, Spinner, UserAvatar } from "@repo/ui";

import { LoadMoreButton } from "@/components/common/load-more-button";
import { REACTION_BY_TYPE, topReactions } from "@/components/feed/reaction-config";
import { useReactors } from "@/hooks/use-posts";

export function ReactionListModal({
  resource,
  id,
  reactionCounts,
  total,
  open,
  onOpenChange,
}: {
  resource: "posts" | "comments";
  id: string;
  reactionCounts: Partial<Record<ReactionType, number>>;
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<ReactionType | null>(null);
  const reactors = useReactors(resource, id, tab, open);
  const items = reactors.data?.pages.flatMap((page) => page.items) ?? [];
  const present = topReactions(reactionCounts, 6);

  useEffect(() => {
    if (open) setTab(null);
  }, [open]);

  const tabClassName = (activeTab: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
      activeTab
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary",
    );

  return (
    <CommonModal open={open} onOpenChange={onOpenChange} title="Reactions">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setTab(null)} className={tabClassName(tab === null)}>
          All <span>{total}</span>
        </button>
        {present.map((reaction) => (
          <button
            key={reaction.type}
            type="button"
            onClick={() => setTab(reaction.type)}
            className={tabClassName(tab === reaction.type)}
          >
            <span aria-hidden>{reaction.emoji}</span>
            <span>{reactionCounts[reaction.type]}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 max-h-80 min-h-24 space-y-1 overflow-y-auto">
        {reactors.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No reactions yet.</p>
        ) : (
          <>
            {items.map((reactor) => {
              const name = `${reactor.user.firstName} ${reactor.user.lastName}`;
              return (
                <div key={reactor.user.id} className="flex items-center gap-3 py-1.5">
                  <div className="relative">
                    <UserAvatar name={name} src={reactor.user.avatarUrl} className="size-9" />
                    <span
                      aria-hidden
                      className="absolute -bottom-1 -right-1 text-sm leading-none"
                    >
                      {REACTION_BY_TYPE[reactor.type].emoji}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{name}</span>
                </div>
              );
            })}
            {reactors.hasNextPage ? (
              <LoadMoreButton
                loading={reactors.isFetchingNextPage}
                onClick={() => void reactors.fetchNextPage()}
                className="w-full py-2 text-sm"
              />
            ) : null}
          </>
        )}
      </div>
    </CommonModal>
  );
}
