import { PostVisibility, type Post, type User } from "@repo/library";

export interface FeedPerson {
  id: string;
  name: string;
  headline: string;
  avatarUrl: string;
}

export interface FeedFriend extends FeedPerson {
  isOnline: boolean;
  lastSeenAt: string | null;
}

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

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const CURRENT_USER: User = {
  id: "user-dylan",
  firstName: "Dylan",
  lastName: "Field",
  email: "dylan@figma.com",
  avatarUrl: "/images/feed/profile.png",
  createdAt: minutesAgo(60 * 24 * 90),
};

const KARIM_SAIF: User = {
  id: "user-karim",
  firstName: "Karim",
  lastName: "Saif",
  email: "karim@buddyscript.com",
  avatarUrl: "/images/feed/person-5.png",
  createdAt: minutesAgo(60 * 24 * 120),
};

const RYAN_ROSLANSKY: User = {
  id: "user-ryan",
  firstName: "Ryan",
  lastName: "Roslansky",
  email: "ryan@linkedin.com",
  avatarUrl: "/images/feed/person-2.png",
  createdAt: minutesAgo(60 * 24 * 200),
};

export const FEED_POSTS: Post[] = [
  {
    id: "post-1",
    content: "-Healthy Tracking App",
    imageUrls: ["/images/feed/post-1.png"],
    visibility: PostVisibility.PUBLIC,
    author: KARIM_SAIF,
    likeCount: 9,
    commentCount: 3,
    shareCount: 122,
    likedByViewer: false,
    createdAt: minutesAgo(5),
  },
  {
    id: "post-2",
    content:
      "Excited to share that our design team just wrapped up the new collaboration features. Feedback is welcome!",
    imageUrls: [],
    visibility: PostVisibility.PUBLIC,
    author: RYAN_ROSLANSKY,
    likeCount: 24,
    commentCount: 8,
    shareCount: 5,
    likedByViewer: true,
    createdAt: minutesAgo(45),
  },
];

export const FEED_STORIES: FeedStory[] = [
  { id: "story-1", name: "Ryan Roslansky", imageUrl: "/images/feed/story-2.png" },
  { id: "story-2", name: "Ryan Roslansky", imageUrl: "/images/feed/story-3.png" },
  { id: "story-3", name: "Ryan Roslansky", imageUrl: "/images/feed/story-4.png" },
];

export const YOUR_STORY_IMAGE = "/images/feed/story-1.png";

export const SUGGESTED_PEOPLE: FeedPerson[] = [
  {
    id: "suggested-1",
    name: "Steve Jobs",
    headline: "CEO of Apple",
    avatarUrl: "/images/feed/person-1.png",
  },
  {
    id: "suggested-2",
    name: "Ryan Roslansky",
    headline: "CEO of Linkedin",
    avatarUrl: "/images/feed/person-2.png",
  },
  {
    id: "suggested-3",
    name: "Dylan Field",
    headline: "CEO of Figma",
    avatarUrl: "/images/feed/person-3.png",
  },
];

export const YOU_MIGHT_LIKE: FeedPerson = {
  id: "like-1",
  name: "Radovan SkillArena",
  headline: "Founder & CEO at Trophy",
  avatarUrl: "/images/feed/person-6.png",
};

export const FRIENDS: FeedFriend[] = [
  {
    id: "friend-1",
    name: "Steve Jobs",
    headline: "CEO of Apple",
    avatarUrl: "/images/feed/person-1.png",
    isOnline: false,
    lastSeenAt: minutesAgo(5),
  },
  {
    id: "friend-2",
    name: "Ryan Roslansky",
    headline: "CEO of Linkedin",
    avatarUrl: "/images/feed/person-2.png",
    isOnline: true,
    lastSeenAt: null,
  },
  {
    id: "friend-3",
    name: "Dylan Field",
    headline: "CEO of Figma",
    avatarUrl: "/images/feed/person-3.png",
    isOnline: true,
    lastSeenAt: null,
  },
  {
    id: "friend-4",
    name: "Steve Jobs",
    headline: "CEO of Apple",
    avatarUrl: "/images/feed/person-1.png",
    isOnline: false,
    lastSeenAt: minutesAgo(5),
  },
  {
    id: "friend-5",
    name: "Ryan Roslansky",
    headline: "CEO of Linkedin",
    avatarUrl: "/images/feed/person-2.png",
    isOnline: true,
    lastSeenAt: null,
  },
  {
    id: "friend-6",
    name: "Dylan Field",
    headline: "CEO of Figma",
    avatarUrl: "/images/feed/person-3.png",
    isOnline: true,
    lastSeenAt: null,
  },
];

export const FEED_EVENTS: FeedEvent[] = [
  {
    id: "event-1",
    title: "International Conference on Design",
    date: "Jul 18, 2026",
    imageUrl: "/images/feed/event-1.png",
    goingCount: 17,
  },
];
