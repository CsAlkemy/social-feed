import { useState } from "react";

import { formatRelativeTime, type Comment, type User } from "@repo/library";
import { CommentSkeleton, UserAvatar } from "@repo/ui";

import { PostCommentBox } from "@/components/feed/posts/post-comment-box";
import { ReactionControl } from "@/components/feed/posts/reaction-control";
import { topReactions } from "@/components/feed/reaction-config";
import {
  useDeleteComment,
  useReactToComment,
  useReplies,
} from "@/hooks/use-comments";

export function CommentItem({
  postId,
  comment,
  viewer,
  isReply = false,
}: {
  postId: string;
  comment: Comment;
  viewer: User;
  isReply?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const reactTo = useReactToComment(postId);
  const deleteComment = useDeleteComment(postId);
  const replies = useReplies(comment.id, showReplies);

  const isAuthor = comment.author.id === viewer.id;
  const authorName = `${comment.author.firstName} ${comment.author.lastName}`;
  const replyItems = replies.data?.pages.flatMap((page) => page.items) ?? [];
  const top = topReactions(comment.reactionCounts);

  return (
    <div className="flex items-start gap-3">
      <UserAvatar name={authorName} src={comment.author.avatarUrl} className="size-8" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="inline-block rounded-2xl bg-secondary px-3 py-2">
          <p className="text-sm font-semibold text-card-foreground">{authorName}</p>
          <p className="whitespace-pre-line text-sm text-foreground">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 px-3 text-xs text-muted-foreground">
          <span suppressHydrationWarning>{formatRelativeTime(comment.createdAt)}</span>
          <ReactionControl
            variant="comment"
            reaction={comment.viewerReaction}
            onReact={(reaction) => reactTo.mutate({ comment, reaction })}
          />
          {comment.likeCount > 0 ? (
            <span className="flex items-center gap-1">
              <span className="flex items-center" aria-hidden>
                {top.map((reaction) => (
                  <span key={reaction.type} className="leading-none">
                    {reaction.emoji}
                  </span>
                ))}
              </span>
              {comment.likeCount}
            </span>
          ) : null}
          {!isReply ? (
            <button
              type="button"
              onClick={() => setShowReplyBox((value) => !value)}
              className="font-medium transition-colors hover:text-foreground"
            >
              Reply
            </button>
          ) : null}
          {isAuthor ? (
            <button
              type="button"
              onClick={() => deleteComment.mutate(comment)}
              className="font-medium transition-colors hover:text-destructive"
            >
              Delete
            </button>
          ) : null}
        </div>

        {!isReply && comment.replyCount > 0 ? (
          <button
            type="button"
            onClick={() => setShowReplies((value) => !value)}
            className="px-3 text-xs font-medium text-primary"
          >
            {showReplies
              ? "Hide replies"
              : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
          </button>
        ) : null}

        {showReplies ? (
          <div className="space-y-3 pt-2">
            {replies.isLoading ? (
              <CommentSkeleton />
            ) : (
              replyItems.map((reply) => (
                <CommentItem
                  key={reply.id}
                  postId={postId}
                  comment={reply}
                  viewer={viewer}
                  isReply
                />
              ))
            )}
            {replies.hasNextPage ? (
              <button
                type="button"
                disabled={replies.isFetchingNextPage}
                onClick={() => void replies.fetchNextPage()}
                className="text-xs font-medium text-primary"
              >
                {replies.isFetchingNextPage ? "Loading…" : "Load more replies"}
              </button>
            ) : null}
          </div>
        ) : null}

        {showReplyBox ? (
          <PostCommentBox
            postId={postId}
            viewer={viewer}
            parentId={comment.id}
            placeholder={`Reply to ${comment.author.firstName}`}
            autoFocus
            onSubmitted={() => {
              setShowReplyBox(false);
              setShowReplies(true);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
