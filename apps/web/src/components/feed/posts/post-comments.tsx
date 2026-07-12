import type { User } from "@repo/library";
import { CommentSkeleton } from "@repo/ui";

import { CommentItem } from "@/components/feed/posts/comment-item";
import { useComments } from "@/hooks/use-comments";

export function PostComments({ postId, viewer }: { postId: string; viewer: User }) {
  const comments = useComments(postId, true);
  const items = comments.data?.pages.flatMap((page) => page.items) ?? [];

  if (comments.isLoading) {
    return (
      <div className="mt-4 space-y-3">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  if (comments.isError) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">Couldn&apos;t load comments.</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        No comments yet. Start the conversation.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {items.map((comment) => (
        <CommentItem key={comment.id} postId={postId} comment={comment} viewer={viewer} />
      ))}
      {comments.hasNextPage ? (
        <button
          type="button"
          disabled={comments.isFetchingNextPage}
          onClick={() => void comments.fetchNextPage()}
          className="text-xs font-medium text-primary"
        >
          {comments.isFetchingNextPage ? "Loading…" : "Load more comments"}
        </button>
      ) : null}
    </div>
  );
}
