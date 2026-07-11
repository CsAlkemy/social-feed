import Image from "next/image";

import { ChevronRightIcon, PlusIcon } from "lucide-react";

import type { User } from "@repo/library";
import { toast } from "@repo/ui";

import { YOUR_STORY_IMAGE, type FeedStory } from "@/components/feed/feed-data";
import { StoryCard } from "@/components/feed/stories/story-card";

function YourStoryCard({ currentUser }: { currentUser: User }) {
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`;

  return (
    <button
      type="button"
      aria-label={`Create a story as ${fullName}`}
      onClick={() => toast.info("Creating a story is not connected yet")}
      className="relative h-40 w-full overflow-hidden rounded-md text-left"
    >
      <Image
        src={YOUR_STORY_IMAGE}
        alt={fullName}
        fill
        sizes="(max-width: 1024px) 25vw, 160px"
        className="object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-white/40">
        <PlusIcon className="size-4" />
      </span>
      <span className="absolute inset-x-1 bottom-2 truncate text-center text-xs font-medium text-white">
        Your Story
      </span>
    </button>
  );
}

export function StoryList({ stories, currentUser }: { stories: FeedStory[]; currentUser: User }) {
  return (
    <div className="relative grid grid-cols-4 gap-3">
      <YourStoryCard currentUser={currentUser} />
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
      <button
        type="button"
        aria-label="Next stories"
        onClick={() => toast.info("Stories are not connected yet")}
        className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  );
}
