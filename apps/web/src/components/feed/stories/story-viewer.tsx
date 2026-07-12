import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { EyeIcon, Trash2Icon, XIcon } from "lucide-react";

import { formatRelativeTime, type StoryGroup, type User } from "@repo/library";
import { cn, toast, UserAvatar } from "@repo/ui";

import { useDeleteStory, useViewStory } from "@/hooks/use-stories";
import { StoryViewersModal } from "@/components/feed/stories/story-viewers-modal";

export function StoryViewer({
  groups,
  startGroup,
  currentUser,
  onClose,
}: {
  groups: StoryGroup[];
  startGroup: number;
  currentUser: User;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ g: startGroup, s: 0 });
  const [showViewers, setShowViewers] = useState(false);
  const viewStory = useViewStory();
  const deleteStory = useDeleteStory();
  const viewedRef = useRef<Set<string>>(new Set());

  const group = groups[pos.g];
  const story = group?.stories[pos.s];

  const next = useCallback(() => {
    setShowViewers(false);
    setPos((current) => {
      const stories = groups[current.g]?.stories ?? [];
      if (current.s + 1 < stories.length) return { g: current.g, s: current.s + 1 };
      if (current.g + 1 < groups.length) return { g: current.g + 1, s: 0 };
      onClose();
      return current;
    });
  }, [groups, onClose]);

  const prev = useCallback(() => {
    setShowViewers(false);
    setPos((current) => {
      if (current.s > 0) return { g: current.g, s: current.s - 1 };
      if (current.g > 0) {
        const previous = groups[current.g - 1]!.stories.length - 1;
        return { g: current.g - 1, s: previous };
      }
      return current;
    });
  }, [groups]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") next();
      else if (event.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  useEffect(() => {
    if (!story || viewedRef.current.has(story.id)) return;
    viewedRef.current.add(story.id);
    if (story.author.id !== currentUser.id) viewStory.mutate(story.id);
  }, [story, currentUser.id, viewStory]);

  if (!story || !group) return null;

  const authorName = `${story.author.firstName} ${story.author.lastName}`;
  const isMine = story.author.id === currentUser.id;

  const handleDelete = () => {
    deleteStory.mutate(story.id, {
      onSuccess: () => {
        toast.success("Story deleted");
        next();
      },
      onError: (error) => toast.error(error.message || "Unable to delete story"),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${authorName}'s story`}
      className="fixed inset-0 z-[45] flex items-center justify-center bg-black/95 p-4"
    >
      <button
        type="button"
        aria-label="Close stories"
        onClick={onClose}
        className="absolute right-4 top-4 z-30 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <XIcon className="size-5" />
      </button>

      <div className="relative h-full max-h-[92vh] w-full max-w-md overflow-hidden rounded-xl bg-neutral-900">
        <div className="absolute inset-x-0 top-0 z-30 flex gap-1 p-3">
          {group.stories.map((segment, index) => (
            <div
              key={segment.id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/40"
            >
              {index < pos.s ? (
                <div className="h-full w-full bg-white" />
              ) : index === pos.s ? (
                <div
                  key={`${pos.g}-${pos.s}`}
                  onAnimationEnd={next}
                  style={{ animationPlayState: showViewers ? "paused" : "running" }}
                  className="h-full w-0 bg-white [animation:story-progress_5000ms_linear_forwards]"
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 top-6 z-30 flex items-center gap-3 px-3 pt-2">
          <UserAvatar
            name={authorName}
            src={story.author.avatarUrl}
            className="size-9 ring-2 ring-white/70"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{authorName}</p>
            <p className="text-xs text-white/70">{formatRelativeTime(story.createdAt)}</p>
          </div>
          {isMine ? (
            <button
              type="button"
              aria-label="Delete story"
              onClick={handleDelete}
              className="mr-12 grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <Trash2Icon className="size-4" />
            </button>
          ) : null}
        </div>

        <Image
          src={story.imageUrl}
          alt={story.caption ?? authorName}
          fill
          sizes="448px"
          unoptimized={story.imageUrl.startsWith("blob:")}
          className="object-contain"
        />

        <button
          type="button"
          aria-label="Previous story"
          onClick={prev}
          className="absolute inset-y-0 left-0 z-10 w-1/3"
        />
        <button
          type="button"
          aria-label="Next story"
          onClick={next}
          className="absolute inset-y-0 right-0 z-10 w-2/3"
        />

        {story.caption ? (
          <p
            className={cn(
              "absolute inset-x-4 z-20 rounded-lg bg-black/40 px-3 py-2 text-center text-sm text-white",
              isMine ? "bottom-16" : "bottom-6",
            )}
          >
            {story.caption}
          </p>
        ) : null}

        {isMine ? (
          <button
            type="button"
            onClick={() => setShowViewers(true)}
            className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            <EyeIcon className="size-4" />
            {story.viewerCount} {story.viewerCount === 1 ? "view" : "views"}
          </button>
        ) : null}
      </div>

      {isMine ? (
        <StoryViewersModal
          storyId={story.id}
          viewerCount={story.viewerCount}
          open={showViewers}
          onOpenChange={setShowViewers}
        />
      ) : null}
    </div>
  );
}
