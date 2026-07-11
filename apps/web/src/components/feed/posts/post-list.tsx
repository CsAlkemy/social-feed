import type { Post, User } from "@repo/library";

import { PostCard } from "@/components/feed/posts/post-card";

export function PostList({
  posts,
  viewer,
  onToggleLike,
}: {
  posts: Post[];
  viewer: User;
  onToggleLike: (postId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} viewer={viewer} onToggleLike={onToggleLike} />
      ))}
    </div>
  );
}
