import { useState } from "react";

import { MessageSquareIcon, Share2Icon } from "lucide-react";

import type { Post, ReactionType } from "@repo/library";
import { CommonButton } from "@repo/ui";

import { ReactionControl } from "@/components/feed/posts/reaction-control";
import { ReactionListModal } from "@/components/feed/posts/reaction-list-modal";
import { ReactionSummary } from "@/components/feed/posts/reaction-summary";
import { ShareModal } from "@/components/feed/posts/share-modal";

const actionButtonClassName =
  "text-muted-foreground hover:bg-secondary hover:text-muted-foreground";

export function PostActions({
  post,
  onReact,
  onToggleComments,
}: {
  post: Post;
  onReact: (reaction: ReactionType | null) => void;
  onToggleComments: () => void;
}) {
  const [showReactors, setShowReactors] = useState(false);
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        {post.likeCount > 0 ? (
          <ReactionSummary
            counts={post.reactionCounts}
            total={post.likeCount}
            onClick={() => setShowReactors(true)}
          />
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onToggleComments}
          className="transition-colors hover:text-foreground hover:underline"
        >
          {post.commentCount} Comment
        </button>
      </div>

      <div className="my-3 border-t border-border/60" />

      <div className="grid grid-cols-3">
        <ReactionControl reaction={post.viewerReaction} onReact={onReact} variant="post" />
        <CommonButton
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          className={actionButtonClassName}
        >
          <MessageSquareIcon className="size-4" />
          Comment
        </CommonButton>
        <CommonButton
          variant="ghost"
          size="sm"
          onClick={() => setShowShare(true)}
          className={actionButtonClassName}
        >
          <Share2Icon className="size-4" />
          Share
        </CommonButton>
      </div>

      <ReactionListModal
        resource="posts"
        id={post.id}
        reactionCounts={post.reactionCounts}
        total={post.likeCount}
        open={showReactors}
        onOpenChange={setShowReactors}
      />
      <ShareModal postId={post.id} open={showShare} onOpenChange={setShowShare} />
    </>
  );
}
