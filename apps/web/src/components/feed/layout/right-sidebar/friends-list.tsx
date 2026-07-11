import { useState } from "react";

import { formatRelativeTime } from "@repo/library";
import { Card, SearchInput, UserAvatar, toast } from "@repo/ui";

import type { FeedFriend } from "@/components/feed/feed-data";

export function FriendsList({ friends }: { friends: FeedFriend[] }) {
  const [query, setQuery] = useState("");

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Friends</h2>
        <button
          type="button"
          className="text-sm font-medium text-primary"
          onClick={() => toast.info("See all friends is not connected yet")}
        >
          See All
        </button>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="input search text"
        containerClassName="mt-4"
      />

      <div className="mt-4 space-y-4">
        {filteredFriends.length === 0 ? (
          <p className="text-sm text-muted-foreground">No friends found.</p>
        ) : (
          filteredFriends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-3">
              <UserAvatar name={friend.name} src={friend.avatarUrl} className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-foreground">{friend.name}</p>
                <p className="truncate text-xs text-muted-foreground">{friend.headline}</p>
              </div>
              {friend.isOnline ? (
                <span className="size-2.5 rounded-full bg-success" aria-label="Online" />
              ) : friend.lastSeenAt ? (
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {formatRelativeTime(friend.lastSeenAt)}
                </span>
              ) : null}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
