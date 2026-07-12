import type { Post, ReactionType, User } from "@repo/library";

import { PostCard } from "@/components/feed/posts/post-card";

export function PostList({
  posts,
  viewer,
  onReact,
}: {
  posts: Post[];
  viewer: User;
  onReact: (post: Post, reaction: ReactionType | null) => void;
}) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} viewer={viewer} onReact={onReact} />
      ))}
    </div>
  );
}
