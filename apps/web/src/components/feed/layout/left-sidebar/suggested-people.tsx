import { Card, CommonButton, UserAvatar, toast } from "@repo/ui";

import type { FeedPerson } from "@/components/feed/feed-data";

export function SuggestedPeople({ people }: { people: FeedPerson[] }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Suggested People</h2>
        <button
          type="button"
          onClick={() => toast.info("See All is not connected yet")}
          className="text-sm font-medium text-primary"
        >
          See All
        </button>
      </div>

      <ul className="mt-4 space-y-4">
        {people.map((person) => (
          <li key={person.id} className="flex items-center gap-3">
            <UserAvatar name={person.name} src={person.avatarUrl} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-card-foreground">{person.name}</p>
              <p className="truncate text-xs text-muted-foreground">{person.headline}</p>
            </div>
            <CommonButton
              variant="outline"
              size="sm"
              onClick={() => toast.info("Connect is not connected yet")}
            >
              Connect
            </CommonButton>
          </li>
        ))}
      </ul>
    </Card>
  );
}
