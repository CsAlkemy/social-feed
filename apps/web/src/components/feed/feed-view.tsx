import { useState } from "react";

import type { Post } from "@repo/library";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { PostComposer, type CreatePostInput } from "@/components/feed/composer/post-composer";
import {
  CURRENT_USER,
  FEED_EVENTS,
  FEED_POSTS,
  FEED_STORIES,
  FRIENDS,
  SUGGESTED_PEOPLE,
  YOU_MIGHT_LIKE,
} from "@/components/feed/feed-data";
import { FeedHeader } from "@/components/feed/layout/feed-header";
import { EventsCard } from "@/components/feed/layout/left-sidebar/events-card";
import { ExploreMenu } from "@/components/feed/layout/left-sidebar/explore-menu";
import { SuggestedPeople } from "@/components/feed/layout/left-sidebar/suggested-people";
import { FriendsList } from "@/components/feed/layout/right-sidebar/friends-list";
import { YouMightLike } from "@/components/feed/layout/right-sidebar/you-might-like";
import { PostList } from "@/components/feed/posts/post-list";
import { StoryList } from "@/components/feed/stories/story-list";

export function FeedView() {
  const [posts, setPosts] = useState<Post[]>(FEED_POSTS);

  const handleToggleLike = (postId: string) => {
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByViewer: !post.likedByViewer,
              likeCount: post.likeCount + (post.likedByViewer ? -1 : 1),
            }
          : post,
      ),
    );
  };

  const handleCreatePost = ({ content, imageUrls, visibility }: CreatePostInput) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      content,
      imageUrls,
      visibility,
      author: CURRENT_USER,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      likedByViewer: false,
      createdAt: new Date().toISOString(),
    };
    setPosts((previousPosts) => [newPost, ...previousPosts]);
  };

  return (
    <div className="flex h-screen flex-col">
      <FeedHeader user={CURRENT_USER} />

      <main className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-12 grid-rows-[100%] gap-4 px-4 sm:px-6 lg:px-8">
        <aside className="scrollbar-none hidden space-y-4 overflow-y-auto overscroll-contain py-6 lg:col-span-3 lg:block">
          <ExploreMenu />
          <SuggestedPeople people={SUGGESTED_PEOPLE} />
          <EventsCard events={FEED_EVENTS} />
        </aside>

        <section className="scrollbar-none col-span-12 space-y-4 overflow-y-auto overscroll-contain py-6 lg:col-span-9 xl:col-span-6">
          <StoryList stories={FEED_STORIES} currentUser={CURRENT_USER} />
          <PostComposer user={CURRENT_USER} onCreate={handleCreatePost} />
          <PostList posts={posts} viewer={CURRENT_USER} onToggleLike={handleToggleLike} />
        </section>

        <aside className="scrollbar-none hidden space-y-4 overflow-y-auto overscroll-contain py-6 xl:col-span-3 xl:block">
          <YouMightLike person={YOU_MIGHT_LIKE} />
          <FriendsList friends={FRIENDS} />
        </aside>
      </main>

      <ThemeToggle />
    </div>
  );
}
