import type { User } from "./user";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  coverUrl: string | null;
  startsAt: string;
  creator: User;
  goingCount: number;
  viewerGoing: boolean;
  createdAt: string;
}
