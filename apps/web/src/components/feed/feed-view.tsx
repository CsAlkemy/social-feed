import type { CreatePostInput, Post, ReactionType } from "@repo/library";
import { Card, CommonButton, FeedSkeleton, Spinner } from "@repo/ui";

import { PostComposer } from "@/components/feed/composer/post-composer";
import { EventsCard } from "@/components/feed/layout/left-sidebar/events-card";
import { ExploreMenu } from "@/components/feed/layout/left-sidebar/explore-menu";
import { SuggestedPeople } from "@/components/feed/layout/left-sidebar/suggested-people";
import { FriendRequests } from "@/components/feed/layout/right-sidebar/friend-requests";
import { FriendsList } from "@/components/feed/layout/right-sidebar/friends-list";
import { PostList } from "@/components/feed/posts/post-list";
import { StoryList } from "@/components/feed/stories/story-list";
import { useSession } from "@/hooks/use-auth";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useCreatePost, useFeed, useReactToPost } from "@/hooks/use-posts";

export function FeedView() {
  const { user } = useSession();
  const feed = useFeed();
  const createPost = useCreatePost();
  const reactToPost = useReactToPost();

  const posts = feed.data?.pages.flatMap((page) => page.items) ?? [];
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    () => void feed.fetchNextPage(),
    feed.hasNextPage && !feed.isFetchingNextPage,
  );

  if (!user) return null;

  const handleReact = (post: Post, reaction: ReactionType | null) =>
    reactToPost.mutate({ post, reaction });

  const handleCreate = (input: CreatePostInput) => createPost.mutateAsync(input);

  return (
    <main className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-12 grid-rows-[100%] gap-4 px-4 sm:px-6 lg:px-8">
      <aside className="scrollbar-none hidden space-y-4 overflow-y-auto overscroll-contain py-6 lg:col-span-3 lg:block">
        <ExploreMenu />
        <SuggestedPeople />
        <EventsCard />
      </aside>

      <section className="scrollbar-none col-span-12 space-y-4 overflow-y-auto overscroll-contain py-6 lg:col-span-9 xl:col-span-6">
        <StoryList currentUser={user} />
        <PostComposer user={user} onCreate={handleCreate} />

        {feed.isLoading ? (
          <FeedSkeleton />
        ) : feed.isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            <p>We couldn&apos;t load the feed.</p>
            <CommonButton
              variant="outline"
              className="mt-3"
              onClick={() => void feed.refetch()}
            >
              Try again
            </CommonButton>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No posts yet. Be the first to share something.
          </Card>
        ) : (
          <>
            <PostList posts={posts} viewer={user} onReact={handleReact} />
            {feed.hasNextPage ? (
              <div ref={sentinelRef} className="flex justify-center pb-2">
                {feed.isFetchingNextPage ? <Spinner /> : null}
              </div>
            ) : null}
          </>
        )}
      </section>

      <aside className="scrollbar-none hidden space-y-4 overflow-y-auto overscroll-contain py-6 xl:col-span-3 xl:block">
        <FriendRequests />
        <FriendsList />
      </aside>
    </main>
  );
}
