import type { PostVisibility } from "../enum/post-visibility";
import type { ReactionType } from "../enum/reaction-type";
import type { User } from "./user";

export interface Post {
  id: string;
  content: string;
  imageUrls: string[];
  visibility: PostVisibility;
  author: User;
  likeCount: number;
  reactionCounts: Partial<Record<ReactionType, number>>;
  viewerReaction: ReactionType | null;
  viewerSaved: boolean;
  commentCount: number;
  shareCount: number;
  createdAt: string;
}
