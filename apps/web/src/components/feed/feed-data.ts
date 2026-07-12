export interface FeedEvent {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  goingCount: number;
}

export const FEED_EVENTS: FeedEvent[] = [
  {
    id: "event-1",
    title: "International Conference on Design",
    date: "Jul 18, 2026",
    imageUrl: "/images/feed/event-1.png",
    goingCount: 17,
  },
];
