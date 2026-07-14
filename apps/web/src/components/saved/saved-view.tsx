import type { Post, ReactionType } from "@repo/library";
import { Card, CommonButton, FeedSkeleton, Spinner } from "@repo/ui";

import { PostList } from "@/components/feed/posts/post-list";
import { useSession } from "@/hooks/use-auth";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useReactToPost, useSavedPosts } from "@/hooks/use-posts";

export function SavedView() {
  const { user } = useSession();
  const saved = useSavedPosts();
  const reactToPost = useReactToPost();

  const posts = saved.data?.pages.flatMap((page) => page.items) ?? [];
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    () => void saved.fetchNextPage(),
    saved.hasNextPage && !saved.isFetchingNextPage,
  );

  if (!user) return null;

  const handleReact = (post: Post, reaction: ReactionType | null) =>
    reactToPost.mutate({ post, reaction });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-semibold">Saved Posts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Posts you saved to revisit later.
        </p>
      </header>

      {saved.isLoading ? (
        <FeedSkeleton />
      ) : saved.isError ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          <p>We couldn&apos;t load your saved posts.</p>
          <CommonButton
            variant="outline"
            className="mt-3"
            onClick={() => void saved.refetch()}
          >
            Try again
          </CommonButton>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nothing saved yet. Choose &quot;Save Post&quot; from a post&apos;s menu to
          keep it here.
        </Card>
      ) : (
        <>
          <PostList posts={posts} viewer={user} onReact={handleReact} />
          {saved.hasNextPage ? (
            <div ref={sentinelRef} className="flex justify-center pb-2">
              {saved.isFetchingNextPage ? <Spinner /> : null}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
