import { formatRelativeTime } from "@repo/library";
import { CommonModal, Spinner, UserAvatar } from "@repo/ui";

import { LoadMoreButton } from "@/components/common/load-more-button";
import { useStoryViewers } from "@/hooks/use-stories";

export function StoryViewersModal({
  storyId,
  viewerCount,
  open,
  onOpenChange,
}: {
  storyId: string;
  viewerCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const viewers = useStoryViewers(storyId, open);
  const items = viewers.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${viewerCount} ${viewerCount === 1 ? "view" : "views"}`}
    >
      <div className="mt-2 max-h-80 min-h-24 space-y-1 overflow-y-auto">
        {viewers.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No views yet.</p>
        ) : (
          <>
            {items.map((viewer) => {
              const name = `${viewer.user.firstName} ${viewer.user.lastName}`;
              return (
                <div key={viewer.user.id} className="flex items-center gap-3 py-1.5">
                  <UserAvatar name={name} src={viewer.user.avatarUrl} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(viewer.viewedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            {viewers.hasNextPage ? (
              <LoadMoreButton
                loading={viewers.isFetchingNextPage}
                onClick={() => void viewers.fetchNextPage()}
                className="w-full py-2 text-sm"
              />
            ) : null}
          </>
        )}
      </div>
    </CommonModal>
  );
}
