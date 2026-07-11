import Image from "next/image";

import { UserAvatar, toast } from "@repo/ui";

import type { FeedStory } from "@/components/feed/feed-data";

export function StoryCard({ story }: { story: FeedStory }) {
  return (
    <button
      type="button"
      aria-label={`View ${story.name} story`}
      onClick={() => toast.info("Stories are not connected yet")}
      className="relative h-40 w-full overflow-hidden rounded-md text-left"
    >
      <Image
        src={story.imageUrl}
        alt={story.name}
        fill
        sizes="(max-width: 1024px) 25vw, 160px"
        className="object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      <span className="absolute right-2 top-2 block size-8 overflow-hidden rounded-full border-2 border-primary-foreground">
        <UserAvatar name={story.name} src={story.imageUrl} className="size-full" />
      </span>
      <span className="absolute inset-x-1 bottom-2 truncate text-center text-xs font-medium text-white">
        {story.name}
      </span>
    </button>
  );
}
