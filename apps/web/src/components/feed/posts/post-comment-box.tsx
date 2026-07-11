import { useState } from "react";

import { CameraIcon, SmileIcon } from "lucide-react";

import type { User } from "@repo/library";
import { toast, UserAvatar } from "@repo/ui";

export function PostCommentBox({ viewer }: { viewer: User }) {
  const [comment, setComment] = useState("");

  return (
    <form
      className="mt-3 flex items-center gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        toast.info("Comments are not connected yet");
        setComment("");
      }}
    >
      <UserAvatar
        name={`${viewer.firstName} ${viewer.lastName}`}
        src={viewer.avatarUrl}
        className="size-8"
      />
      <div className="relative flex-1">
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write a comment"
          className="h-10 w-full rounded-full bg-secondary pl-4 pr-16 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-muted-foreground">
          <button
            type="button"
            aria-label="Add an emoji"
            onClick={() => toast.info("Comments are not connected yet")}
          >
            <SmileIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Attach a photo"
            onClick={() => toast.info("Comments are not connected yet")}
          >
            <CameraIcon className="size-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
