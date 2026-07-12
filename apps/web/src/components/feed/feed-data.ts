export interface FeedStory {
  id: string;
  name: string;
  imageUrl: string;
}

export interface FeedEvent {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  goingCount: number;
}

export const FEED_STORIES: FeedStory[] = [
  { id: "story-1", name: "Ryan Roslansky", imageUrl: "/images/feed/story-2.png" },
  { id: "story-2", name: "Ryan Roslansky", imageUrl: "/images/feed/story-3.png" },
  { id: "story-3", name: "Ryan Roslansky", imageUrl: "/images/feed/story-4.png" },
];

export const YOUR_STORY_IMAGE = "/images/feed/story-1.png";

export const FEED_EVENTS: FeedEvent[] = [
  {
    id: "event-1",
    title: "International Conference on Design",
    date: "Jul 18, 2026",
    imageUrl: "/images/feed/event-1.png",
    goingCount: 17,
  },
];
