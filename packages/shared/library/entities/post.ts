import type { PostVisibility } from "../enum/post-visibility";
import type { User } from "./user";

export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  visibility: PostVisibility;
  author: User;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  createdAt: string;
}
