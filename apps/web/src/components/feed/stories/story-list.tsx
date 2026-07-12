import Image from "next/image";
import { useCallback, useState } from "react";

import { PlusIcon } from "lucide-react";

import type { StoryGroup, User } from "@repo/library";
import { Spinner, UserAvatar } from "@repo/ui";

import { StoryCard } from "@/components/feed/stories/story-card";
import { StoryComposerModal } from "@/components/feed/stories/story-composer-modal";
import { StoryViewer } from "@/components/feed/stories/story-viewer";
import { useStories } from "@/hooks/use-stories";

function YourStoryCard({
  currentUser,
  ownGroup,
  onView,
  onCreate,
}: {
  currentUser: User;
  ownGroup: StoryGroup | null;
  onView: () => void;
  onCreate: () => void;
}) {
  const name = `${currentUser.firstName} ${currentUser.lastName}`;
  const cover = ownGroup ? ownGroup.stories[ownGroup.stories.length - 1]!.imageUrl : null;
  const badgeClassName =
    "absolute left-1/2 top-[42%] z-10 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-background";

  return (
    <div className="relative h-44 w-28 shrink-0 overflow-hidden rounded-xl bg-secondary sm:w-32">
      <button
        type="button"
        onClick={ownGroup ? onView : onCreate}
        aria-label={ownGroup ? "View your story" : "Create a story"}
        className="absolute inset-0 h-full w-full text-left"
      >
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="128px"
            unoptimized={cover.startsWith("blob:")}
            className="object-cover"
          />
        ) : (
          <UserAvatar
            name={name}
            src={currentUser.avatarUrl}
            className="size-full rounded-none"
            fallbackClassName="rounded-none bg-gradient-to-b from-primary/25 to-secondary text-2xl"
          />
        )}
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute inset-x-1.5 bottom-2 truncate text-center text-xs font-medium text-white">
          Your Story
        </span>
      </button>
      {ownGroup ? (
        <button
          type="button"
          onClick={onCreate}
          aria-label="Add to your story"
          className={`${badgeClassName} transition-colors hover:bg-primary/90`}
        >
          <PlusIcon className="size-4" />
        </button>
      ) : (
        <span aria-hidden className={`${badgeClassName} pointer-events-none`}>
          <PlusIcon className="size-4" />
        </span>
      )}
    </div>
  );
}

export function StoryList({ currentUser }: { currentUser: User }) {
  const stories = useStories();
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewer, setViewer] = useState<{ groups: StoryGroup[]; start: number } | null>(null);

  const closeViewer = useCallback(() => setViewer(null), []);

  const groups = stories.data ?? [];
  const ownGroup = groups.find((group) => group.author.id === currentUser.id) ?? null;
  const otherGroups = groups.filter((group) => group.author.id !== currentUser.id);

  return (
    <div className="flex gap-3 overflow-x-auto px-0.5 py-1.5 scrollbar-none">
      <YourStoryCard
        currentUser={currentUser}
        ownGroup={ownGroup}
        onView={() => ownGroup && setViewer({ groups: [ownGroup], start: 0 })}
        onCreate={() => setComposerOpen(true)}
      />

      {stories.isLoading ? (
        <div className="flex h-44 w-28 shrink-0 items-center justify-center rounded-xl bg-secondary sm:w-32">
          <Spinner className="size-5 text-muted-foreground" />
        </div>
      ) : (
        otherGroups.map((group, index) => (
          <StoryCard
            key={group.author.id}
            group={group}
            onOpen={() => setViewer({ groups: otherGroups, start: index })}
          />
        ))
      )}

      <StoryComposerModal
        open={composerOpen}
        onOpenChange={setComposerOpen}
        currentUser={currentUser}
      />
      {viewer ? (
        <StoryViewer
          groups={viewer.groups}
          startGroup={viewer.start}
          currentUser={currentUser}
          onClose={closeViewer}
        />
      ) : null}
    </div>
  );
}
