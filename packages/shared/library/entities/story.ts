import type { User } from "./user";

export interface Story {
  id: string;
  author: User;
  imageUrl: string;
  caption: string | null;
  viewed: boolean;
  viewerCount: number;
  createdAt: string;
  expiresAt: string;
}

export interface StoryGroup {
  author: User;
  stories: Story[];
  hasUnseen: boolean;
}

export interface StoryViewer {
  user: User;
  viewedAt: string;
}
