import type { PostVisibility } from "../enum/post-visibility";
import type { User } from "./user";

export interface Post {
  id: string;
  content: string;
  imageUrls: string[];
  visibility: PostVisibility;
  author: User;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  likedByViewer: boolean;
  createdAt: string;
}
