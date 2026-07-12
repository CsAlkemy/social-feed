import { useState } from "react";

import { EllipsisVerticalIcon } from "lucide-react";

import {
  formatRelativeTime,
  PostVisibility,
  type Post,
  type ReactionType,
  type User,
} from "@repo/library";
import {
  Card,
  CommonDropdown,
  toast,
  UserAvatar,
  type CommonDropdownItem,
} from "@repo/ui";

import { EditPostModal } from "@/components/feed/posts/edit-post-modal";
import { PostActions } from "@/components/feed/posts/post-actions";
import { PostComments } from "@/components/feed/posts/post-comments";
import { PostCommentBox } from "@/components/feed/posts/post-comment-box";
import { PostImageGrid } from "@/components/feed/posts/post-image-grid";
import { useDeletePost } from "@/hooks/use-posts";

export function PostCard({
  post,
  viewer,
  onReact,
}: {
  post: Post;
  viewer: User;
  onReact: (post: Post, reaction: ReactionType | null) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const deletePost = useDeletePost();

  const authorName = `${post.author.firstName} ${post.author.lastName}`;
  const isAuthor = post.author.id === viewer.id;

  const handleDelete = () =>
    deletePost.mutate(post.id, {
      onSuccess: () => toast.success("Post deleted"),
      onError: (error) => toast.error(error.message || "Unable to delete post"),
    });

  const menuItems: CommonDropdownItem[] = [
    { label: "Save Post", onSelect: () => toast.info("Save Post is not connected yet") },
    {
      label: "Turn On Notification",
      onSelect: () => toast.info("Turn On Notification is not connected yet"),
    },
    { label: "Hide", onSelect: () => toast.info("Hide is not connected yet") },
    ...(isAuthor
      ? ([
          { label: "Edit Post", onSelect: () => setIsEditing(true) },
          { type: "separator" },
          { label: "Delete Post", destructive: true, onSelect: handleDelete },
        ] satisfies CommonDropdownItem[])
      : []),
  ];

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
          items={menuItems}
        />
      </div>

      {post.content ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {post.content}
        </p>
      ) : null}
      <PostImageGrid images={post.imageUrls} />

      <PostActions
        post={post}
        onReact={(reaction) => onReact(post, reaction)}
        onToggleComments={() => setShowComments((value) => !value)}
      />
      <PostCommentBox
        postId={post.id}
        viewer={viewer}
        onSubmitted={() => setShowComments(true)}
      />
      {showComments ? <PostComments postId={post.id} viewer={viewer} /> : null}

      {isAuthor ? (
        <EditPostModal post={post} open={isEditing} onOpenChange={setIsEditing} />
      ) : null}
    </Card>
  );
}
