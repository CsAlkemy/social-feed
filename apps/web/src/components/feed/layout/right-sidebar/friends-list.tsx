import { useState } from "react";

import Link from "next/link";

import { Card, SearchInput, Spinner, UserAvatar } from "@repo/ui";

import { useFriends } from "@/hooks/use-friends";

export function FriendsList() {
  const [query, setQuery] = useState("");
  const friends = useFriends();

  const items = friends.data?.pages.flatMap((page) => page.items) ?? [];
  const filteredFriends = items.filter((friend) =>
    `${friend.firstName} ${friend.lastName}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Friends</h2>
        <Link href="/members" className="text-sm font-medium text-primary">
          See All
        </Link>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search friends"
        containerClassName="mt-4"
      />

      <div className="mt-4 space-y-4">
        {friends.isLoading ? (
          <div className="flex justify-center py-2">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {items.length === 0 ? "No friends yet." : "No friends found."}
          </p>
        ) : (
          filteredFriends.map((friend) => {
            const name = `${friend.firstName} ${friend.lastName}`;
            return (
              <div key={friend.id} className="flex items-center gap-3">
                <UserAvatar name={name} src={friend.avatarUrl} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{friend.email}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
