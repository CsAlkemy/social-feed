import { useState } from "react";

import { cn, SearchInput } from "@repo/ui";

import { MemberGrid } from "@/components/members/member-grid";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useFriendRequests, useFriends, useMembers } from "@/hooks/use-friends";

type Tab = "discover" | "friends" | "requests";

export function MembersView() {
  const [tab, setTab] = useState<Tab>("discover");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const members = useMembers(debouncedSearch);
  const friends = useFriends();
  const requests = useFriendRequests("incoming");

  const requestCount =
    requests.data?.pages.reduce((total, page) => total + page.items.length, 0) ??
    0;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "discover", label: "Discover" },
    { key: "friends", label: "My Friends" },
    { key: "requests", label: "Friend Requests", count: requestCount },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-semibold">People</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find people, manage requests, and keep up with your friends.
        </p>
      </header>

      <div className="border-b">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {count ? (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {tab === "discover" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search people"
              containerClassName="w-full max-w-xs"
            />
          </div>
          <MemberGrid query={members} emptyMessage="No members found." />
        </div>
      ) : tab === "friends" ? (
        <MemberGrid
          query={friends}
          emptyMessage="You haven't added any friends yet."
        />
      ) : (
        <MemberGrid
          query={requests}
          emptyMessage="No friend requests right now."
        />
      )}
    </main>
  );
}
