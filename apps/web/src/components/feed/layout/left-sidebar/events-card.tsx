import Image from "next/image";

import { Card } from "@repo/ui";

import type { FeedEvent } from "@/components/feed/feed-data";

export function EventsCard({ events }: { events: FeedEvent[] }) {
  return (
    <Card className="p-5 opacity-60">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-muted-foreground">Events</h2>
        <button
          type="button"
          disabled
          className="cursor-not-allowed text-sm font-medium text-muted-foreground"
        >
          See all
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {events.map((event) => {
          const eventDate = new Date(event.date);

          return (
            <li key={event.id}>
              <Image
                src={event.imageUrl}
                alt={event.title}
                width={400}
                height={160}
                className="h-32 w-full rounded-md object-cover grayscale"
              />
              <div className="mt-3 flex items-start gap-3">
                <div className="shrink-0 text-center leading-tight">
                  <p className="text-lg font-bold text-muted-foreground">{eventDate.getDate()}</p>
                  <p className="text-xs text-muted-foreground">
                    {eventDate.toLocaleString("en-US", { month: "short" })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">{event.title}</p>
              </div>
              <div className="my-3 border-t border-border/60" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{event.goingCount} People Going</p>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed text-sm font-medium text-muted-foreground"
                >
                  Going
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
