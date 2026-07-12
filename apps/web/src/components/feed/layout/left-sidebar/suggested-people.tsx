import Link from "next/link";

import { Card, Spinner, UserAvatar } from "@repo/ui";

import { FriendAction } from "@/components/members/friend-action";
import { useSuggestions } from "@/hooks/use-friends";

export function SuggestedPeople() {
  const suggestions = useSuggestions();
  const people = suggestions.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Suggested People</h2>
        <Link href="/members" className="text-sm font-medium text-primary">
          See All
        </Link>
      </div>

      {suggestions.isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner className="size-5 text-muted-foreground" />
        </div>
      ) : people.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No suggestions right now.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {people.map((person) => {
            const name = `${person.firstName} ${person.lastName}`;
            return (
              <li key={person.id} className="flex items-center gap-3">
                <UserAvatar name={name} src={person.avatarUrl} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{person.email}</p>
                </div>
                <FriendAction member={person} />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
