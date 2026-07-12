import type { ReactionType } from "../enum/reaction-type";
import type { User } from "./user";

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  author: User;
  likeCount: number;
  reactionCounts: Partial<Record<ReactionType, number>>;
  viewerReaction: ReactionType | null;
  replyCount: number;
  createdAt: string;
}
