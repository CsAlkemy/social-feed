import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { cn, SearchInput } from "@repo/ui";

import { MemberGrid } from "@/components/members/member-grid";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useFriendRequests, useFriends, useMembers } from "@/hooks/use-friends";

type Tab = "friends" | "discover";

export function MembersView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("friends");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const queryParam = typeof router.query.q === "string" ? router.query.q : "";
  useEffect(() => {
    if (!queryParam) return;
    setSearch(queryParam);
    setTab("discover");
  }, [queryParam]);

  const tabParam = typeof router.query.tab === "string" ? router.query.tab : "";
  useEffect(() => {
    if (tabParam === "discover") setTab("discover");
  }, [tabParam]);

  const members = useMembers(debouncedSearch);
  const friends = useFriends();
  const requests = useFriendRequests("incoming");

  const requestCount = requests.data?.pages[0]?.total ?? 0;
  const friendCount = friends.data?.pages[0]?.total ?? 0;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "friends", label: "My Friends", count: friendCount },
    { key: "discover", label: "Discover" },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-semibold">People</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find people, manage requests, and keep up with your friends.
        </p>
      </header>

      {requestCount > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Friend Requests</h2>
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
              {requestCount}
            </span>
          </div>
          <MemberGrid
            query={requests}
            emptyMessage="No friend requests right now."
          />
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="inline-flex gap-1 rounded-xl border bg-card p-1 shadow-sm">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors",
                tab === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {label}
              {count ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                    tab === key
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === "friends" ? (
          <MemberGrid
            query={friends}
            emptyMessage="You haven't added any friends yet."
          />
        ) : (
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
        )}
      </section>
    </main>
  );
}
