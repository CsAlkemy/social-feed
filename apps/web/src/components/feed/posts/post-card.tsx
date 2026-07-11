import { EllipsisVerticalIcon } from "lucide-react";

import { formatRelativeTime, PostVisibility, type Post, type User } from "@repo/library";
import { Card, CommonDropdown, toast, UserAvatar } from "@repo/ui";

import { PostActions } from "@/components/feed/posts/post-actions";
import { PostCommentBox } from "@/components/feed/posts/post-comment-box";
import { PostImageGrid } from "@/components/feed/posts/post-image-grid";

export function PostCard({
  post,
  viewer,
  onToggleLike,
}: {
  post: Post;
  viewer: User;
  onToggleLike: (postId: string) => void;
}) {
  const authorName = `${post.author.firstName} ${post.author.lastName}`;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <UserAvatar name={authorName} src={post.author.avatarUrl} className="size-10" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-card-foreground">{authorName}</p>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            {formatRelativeTime(post.createdAt)} ·{" "}
            {post.visibility === PostVisibility.PUBLIC ? "Public" : "Private"}
          </p>
        </div>
        <CommonDropdown
          trigger={
            <button
              type="button"
              aria-label="Post options"
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
            >
              <EllipsisVerticalIcon className="size-4" />
            </button>
          }
          items={[
            { label: "Save Post", onSelect: () => toast.info("Save Post is not connected yet") },
            {
              label: "Turn On Notification",
              onSelect: () => toast.info("Turn On Notification is not connected yet"),
            },
            { label: "Hide", onSelect: () => toast.info("Hide is not connected yet") },
            { label: "Edit Post", onSelect: () => toast.info("Edit Post is not connected yet") },
            { type: "separator" },
            {
              label: "Delete Post",
              destructive: true,
              onSelect: () => toast.info("Delete Post is not connected yet"),
            },
          ]}
        />
      </div>

      {post.content ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {post.content}
        </p>
      ) : null}
      <PostImageGrid images={post.imageUrls} />

      <PostActions post={post} onToggleLike={onToggleLike} />
      <PostCommentBox viewer={viewer} />
    </Card>
  );
}
