import { MessageSquareIcon, Share2Icon, ThumbsUpIcon } from "lucide-react";

import type { Post } from "@repo/library";
import { cn, toast } from "@repo/ui";

const actionButtonClassName =
  "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-secondary";

export function PostActions({
  post,
  onToggleLike,
}: {
  post: Post;
  onToggleLike: (postId: string) => void;
}) {
  return (
    <>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ThumbsUpIcon className="size-3" />
          </span>
          {post.likeCount}
        </div>
        <div className="flex items-center gap-3">
          <span>{post.commentCount} Comment</span>
          <span>{post.shareCount} Share</span>
        </div>
      </div>

      <div className="my-3 border-t border-border/60" />

      <div className="grid grid-cols-3">
        <button
          type="button"
          aria-pressed={post.likedByViewer}
          onClick={() => onToggleLike(post.id)}
          className={cn(
            actionButtonClassName,
            post.likedByViewer ? "text-primary" : "text-muted-foreground",
          )}
        >
          <ThumbsUpIcon className={cn("size-4", post.likedByViewer && "fill-current")} />
          Like
        </button>
        <button
          type="button"
          onClick={() => toast.info("Comments are not connected yet")}
          className={cn(actionButtonClassName, "text-muted-foreground")}
        >
          <MessageSquareIcon className="size-4" />
          Comment
        </button>
        <button
          type="button"
          onClick={() => toast.info("Sharing is not connected yet")}
          className={cn(actionButtonClassName, "text-muted-foreground")}
        >
          <Share2Icon className="size-4" />
          Share
        </button>
      </div>
    </>
  );
}
