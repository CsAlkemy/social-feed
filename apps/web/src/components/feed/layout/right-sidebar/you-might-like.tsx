import { Card, CommonButton, UserAvatar, toast } from "@repo/ui";

import type { FeedPerson } from "@/components/feed/feed-data";

export function YouMightLike({ person }: { person: FeedPerson }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">You Might Like</h2>
        <button
          type="button"
          className="text-sm font-medium text-primary"
          onClick={() => toast.info("See all suggestions is not connected yet")}
        >
          See All
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <UserAvatar name={person.name} src={person.avatarUrl} className="size-12" />
        <div className="min-w-0">
          <p className="text-base font-semibold text-card-foreground">{person.name}</p>
          <p className="text-xs text-muted-foreground">{person.headline}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <CommonButton
          variant="secondary"
          onClick={() => toast.info("Ignore is not connected yet")}
        >
          Ignore
        </CommonButton>
        <CommonButton onClick={() => toast.info("Follow is not connected yet")}>
          Follow
        </CommonButton>
      </div>
    </Card>
  );
}
