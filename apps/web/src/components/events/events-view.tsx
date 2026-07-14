import { useState } from "react";

import { CalendarPlusIcon } from "lucide-react";

import { Card, CommonButton, Skeleton, Spinner } from "@repo/ui";

import { CreateEventModal } from "@/components/events/create-event-modal";
import { EventCard } from "@/components/events/event-card";
import { useSession } from "@/hooks/use-auth";
import { useEvents } from "@/hooks/use-events";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

export function EventsView() {
  const { user } = useSession();
  const events = useEvents();
  const [isCreating, setIsCreating] = useState(false);

  const items = events.data?.pages.flatMap((page) => page.items) ?? [];
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    () => void events.fetchNextPage(),
    events.hasNextPage && !events.isFetchingNextPage,
  );

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upcoming events from the community.
          </p>
        </div>
        <CommonButton onClick={() => setIsCreating(true)}>
          <CalendarPlusIcon className="size-4" />
          Create Event
        </CommonButton>
      </header>

      {events.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : events.isError ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          <p>We couldn&apos;t load the events.</p>
          <CommonButton
            variant="outline"
            className="mt-3"
            onClick={() => void events.refetch()}
          >
            Try again
          </CommonButton>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No upcoming events yet. Create the first one.
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {events.hasNextPage ? (
            <div ref={sentinelRef} className="flex justify-center pb-2">
              {events.isFetchingNextPage ? <Spinner /> : null}
            </div>
          ) : null}
        </>
      )}

      <CreateEventModal open={isCreating} onOpenChange={setIsCreating} />
    </main>
  );
}
