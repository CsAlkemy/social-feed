import { useState, type FormEvent } from "react";

import type { User } from "@repo/library";
import { toast, UserAvatar } from "@repo/ui";

import { EmojiPicker } from "@/components/common/emoji-picker";
import { useCreateComment } from "@/hooks/use-comments";

export function PostCommentBox({
  postId,
  viewer,
  parentId,
  placeholder = "Write a comment",
  autoFocus = false,
  onSubmitted,
}: {
  postId: string;
  viewer: User;
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
}) {
  const [content, setContent] = useState("");
  const createComment = useCreateComment(postId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = content.trim();
    if (!value || createComment.isPending) return;

    createComment.mutate(
      { content: value, parentId },
      {
        onSuccess: () => {
          setContent("");
          onSubmitted?.();
        },
        onError: (error) =>
          toast.error(error.message || "Unable to post your comment"),
      },
    );
  };

  return (
    <form className="mt-3 flex items-center gap-3" onSubmit={handleSubmit}>
      <UserAvatar
        name={`${viewer.firstName} ${viewer.lastName}`}
        src={viewer.avatarUrl}
        className="size-8"
      />
      <div className="relative flex-1">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={createComment.isPending}
          className="h-10 w-full rounded-full bg-secondary pl-4 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">
          <EmojiPicker
            onSelect={(emoji) => setContent((value) => value + emoji)}
            className="transition-colors hover:text-foreground"
          />
        </div>
      </div>
    </form>
  );
}
