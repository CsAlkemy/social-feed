import Image from "next/image";
import Link from "next/link";

import { CalendarDaysIcon, CheckIcon } from "lucide-react";

import type { Event } from "@repo/library";
import { Card, cn, Skeleton } from "@repo/ui";

import { useEventAttendance, useEvents } from "@/hooks/use-events";

export function EventsCard() {
  const events = useEvents();
  const attendance = useEventAttendance();

  const items = (events.data?.pages.flatMap((page) => page.items) ?? []).slice(0, 2);

  const isToggling = (event: Event) =>
    attendance.isPending && attendance.variables?.event.id === event.id;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Events</h2>
        <Link href="/events" className="text-sm font-medium text-primary hover:underline">
          See all
        </Link>
      </div>

      {events.isLoading ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No upcoming events yet. Create one from the composer above.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((event) => {
            const eventDate = new Date(event.startsAt);

            return (
              <li key={event.id}>
                {event.coverUrl ? (
                  <Image
                    src={event.coverUrl}
                    alt={event.title}
                    width={400}
                    height={160}
                    className="h-32 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-md bg-secondary">
                    <CalendarDaysIcon className="size-8 text-muted-foreground" />
                  </div>
                )}
                <div className="mt-3 flex items-start gap-3">
                  <div className="shrink-0 text-center leading-tight">
                    <p className="text-lg font-bold text-primary">{eventDate.getDate()}</p>
                    <p className="text-xs text-muted-foreground">
                      {eventDate.toLocaleString("en-US", { month: "short" })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{event.title}</p>
                </div>
                <div className="my-3 border-t border-border/60" />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {event.goingCount} People Going
                  </p>
                  <button
                    type="button"
                    disabled={isToggling(event)}
                    onClick={() =>
                      attendance.mutate({ event, going: !event.viewerGoing })
                    }
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors disabled:opacity-60",
                      event.viewerGoing
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {event.viewerGoing ? <CheckIcon className="size-4" /> : null}
                    Going
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
