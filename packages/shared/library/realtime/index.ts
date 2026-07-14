import type { ReactionType } from "../enum/reaction-type";

export interface PostReactionEvent {
  postId: string;
  likeCount: number;
  reactionCounts: Partial<Record<ReactionType, number>>;
}

export interface CommentReactionEvent {
  commentId: string;
  postId: string;
  parentId: string | null;
  likeCount: number;
  reactionCounts: Partial<Record<ReactionType, number>>;
}

export interface CommentChangeEvent {
  commentId: string;
  postId: string;
  parentId: string | null;
  postCommentCount: number;
  parentReplyCount: number | null;
}

export interface RealtimeEvents {
  "post:reaction": PostReactionEvent;
  "comment:reaction": CommentReactionEvent;
  "comment:created": CommentChangeEvent;
  "comment:deleted": CommentChangeEvent;
}
