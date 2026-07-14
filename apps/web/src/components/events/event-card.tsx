import Image from "next/image";

import { CalendarDaysIcon, CheckIcon, MapPinIcon } from "lucide-react";

import type { Event } from "@repo/library";
import { Card, CommonButton, UserAvatar } from "@repo/ui";

import { useEventAttendance } from "@/hooks/use-events";

export function EventCard({ event }: { event: Event }) {
  const attendance = useEventAttendance();

  const eventDate = new Date(event.startsAt);
  const creatorName = `${event.creator.firstName} ${event.creator.lastName}`;

  return (
    <Card className="flex flex-col overflow-hidden">
      {event.coverUrl ? (
        <div className="relative aspect-video w-full">
          <Image src={event.coverUrl} alt={event.title} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-secondary">
          <CalendarDaysIcon className="size-10 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            {eventDate.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <h3 className="mt-1 text-base font-semibold text-card-foreground">
            {event.title}
          </h3>
          {event.location ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" />
              {event.location}
            </p>
          ) : null}
        </div>

        {event.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div
            className="flex items-center gap-2 text-xs text-muted-foreground"
            title={`Hosted by ${creatorName}`}
          >
            <UserAvatar
              name={creatorName}
              src={event.creator.avatarUrl}
              className="size-6"
            />
            <span>{event.goingCount} People Going</span>
          </div>
          <CommonButton
            size="sm"
            variant={event.viewerGoing ? "secondary" : "default"}
            loading={attendance.isPending}
            onClick={() => attendance.mutate({ event, going: !event.viewerGoing })}
          >
            {event.viewerGoing ? <CheckIcon className="size-4" /> : null}
            Going
          </CommonButton>
        </div>
      </div>
    </Card>
  );
}
