import Image from "next/image";

import type { StoryGroup } from "@repo/library";
import { cn, UserAvatar } from "@repo/ui";

export function StoryCard({
  group,
  onOpen,
}: {
  group: StoryGroup;
  onOpen: () => void;
}) {
  const { author } = group;
  const name = `${author.firstName} ${author.lastName}`;
  const cover = group.stories[group.stories.length - 1]!.imageUrl;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${name}'s story`}
      className={cn(
        "relative h-44 w-28 shrink-0 overflow-hidden rounded-xl text-left ring-2 ring-offset-2 ring-offset-background transition sm:w-32",
        group.hasUnseen ? "ring-primary" : "ring-border",
      )}
    >
      <Image
        src={cover}
        alt={name}
        fill
        sizes="128px"
        unoptimized={cover.startsWith("blob:")}
        className="object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      <span
        className={cn(
          "absolute left-2 top-2 block size-9 overflow-hidden rounded-full ring-2",
          group.hasUnseen ? "ring-primary" : "ring-white/70",
        )}
      >
        <UserAvatar name={name} src={author.avatarUrl} className="size-full" />
      </span>
      <span className="absolute inset-x-1.5 bottom-2 truncate text-xs font-medium text-white">
        {author.firstName}
      </span>
    </button>
  );
}
