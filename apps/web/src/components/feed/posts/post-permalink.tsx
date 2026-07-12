import type { Post, ReactionType } from "@repo/library";
import { Card, PostSkeleton } from "@repo/ui";

import { PostCard } from "@/components/feed/posts/post-card";
import { useSession } from "@/hooks/use-auth";
import { usePost, useReactToPost } from "@/hooks/use-posts";

export function PostPermalink({ id }: { id: string }) {
  const { user } = useSession();
  const post = usePost(id);
  const reactToPost = useReactToPost();

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      {post.isLoading ? (
        <PostSkeleton />
      ) : post.isError || !post.data ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          This post isn&apos;t available.
        </Card>
      ) : (
        <PostCard
          post={post.data}
          viewer={user}
          onReact={(target: Post, reaction: ReactionType | null) =>
            reactToPost.mutate({ post: target, reaction })
          }
        />
      )}
    </main>
  );
}
