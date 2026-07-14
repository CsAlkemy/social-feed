import type {
  ApiError,
  CreatePostInput,
  Page,
  Post,
  Reactor,
  ReactionType,
  UpdatePostInput,
} from "@repo/library";
import { apiRequest, apiUrl } from "@repo/library/apis";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { applyReaction } from "@/hooks/apply-reaction";
import { patchInfiniteItem, removeInfiniteItem } from "@/hooks/infinite-cache";

export const feedKey = ["posts", "feed"] as const;
export const savedPostsKey = ["posts", "saved"] as const;
export const postKey = (postId: string) => ["post", postId] as const;

export function usePost(postId: string) {
  return useQuery<Post, ApiError>({
    queryKey: postKey(postId),
    queryFn: () => apiRequest<Post>("get", apiUrl("posts", postId)),
    enabled: Boolean(postId),
  });
}

export function useFeed(limit = 10) {
  return useInfiniteQuery({
    queryKey: feedKey,
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Post>>(
        "get",
        `${apiUrl("posts")}?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useSavedPosts(limit = 10) {
  return useInfiniteQuery({
    queryKey: savedPostsKey,
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Post>>(
        "get",
        `${apiUrl("posts", "saved")}?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useToggleSavePost() {
  const queryClient = useQueryClient();

  return useMutation<Post, ApiError, Post>({
    mutationFn: (post) =>
      post.viewerSaved
        ? apiRequest<Post>("delete", apiUrl("posts", `${post.id}/save`))
        : apiRequest<Post>("put", apiUrl("posts", `${post.id}/save`)),
    onSuccess: (updated) => {
      const patch = (current: Post): Post => ({
        ...current,
        viewerSaved: updated.viewerSaved,
      });
      patchInfiniteItem<Post>(queryClient, feedKey, updated.id, patch);
      queryClient.setQueryData<Post>(postKey(updated.id), (current) =>
        current ? patch(current) : current,
      );
      if (updated.viewerSaved) {
        void queryClient.invalidateQueries({ queryKey: savedPostsKey });
      } else {
        removeInfiniteItem<Post>(queryClient, savedPostsKey, updated.id);
      }
    },
  });
}

export function useReactors(
  resource: "posts" | "comments",
  id: string,
  type: ReactionType | null,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: [resource, id, "reactions", type ?? "ALL"],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: "20" });
      if (pageParam) params.set("cursor", pageParam);
      if (type) params.set("type", type);
      return apiRequest<Page<Reactor>>(
        "get",
        `${apiUrl(resource, `${id}/reactions`)}?${params.toString()}`,
      );
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation<Post, ApiError, CreatePostInput>({
    mutationFn: (input) => apiRequest<Post>("post", apiUrl("posts"), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedKey }),
  });
}

export function useReactToPost() {
  const queryClient = useQueryClient();

  return useMutation<
    Post,
    ApiError,
    { post: Post; reaction: ReactionType | null },
    {
      previous?: InfiniteData<Page<Post>>;
      previousSaved?: InfiniteData<Page<Post>>;
      previousSingle?: Post;
    }
  >({
    mutationFn: ({ post, reaction }) =>
      reaction
        ? apiRequest<Post>("put", apiUrl("posts", `${post.id}/reaction`), {
            type: reaction,
          })
        : apiRequest<Post>("delete", apiUrl("posts", `${post.id}/reaction`)),
    onMutate: async ({ post, reaction }) => {
      const single = postKey(post.id);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: feedKey }),
        queryClient.cancelQueries({ queryKey: savedPostsKey }),
        queryClient.cancelQueries({ queryKey: single }),
      ]);
      const previous = queryClient.getQueryData<InfiniteData<Page<Post>>>(feedKey);
      const previousSaved =
        queryClient.getQueryData<InfiniteData<Page<Post>>>(savedPostsKey);
      const previousSingle = queryClient.getQueryData<Post>(single);
      patchInfiniteItem<Post>(queryClient, feedKey, post.id, (current) =>
        applyReaction(current, reaction),
      );
      patchInfiniteItem<Post>(queryClient, savedPostsKey, post.id, (current) =>
        applyReaction(current, reaction),
      );
      queryClient.setQueryData<Post>(single, (current) =>
        current ? applyReaction(current, reaction) : current,
      );
      return { previous, previousSaved, previousSingle };
    },
    onError: (_error, { post }, context) => {
      if (context?.previous) queryClient.setQueryData(feedKey, context.previous);
      if (context?.previousSaved) {
        queryClient.setQueryData(savedPostsKey, context.previousSaved);
      }
      if (context?.previousSingle) {
        queryClient.setQueryData(postKey(post.id), context.previousSingle);
      }
    },
    onSuccess: (updated) => {
      const patch = (current: Post): Post => ({
        ...current,
        likeCount: updated.likeCount,
        reactionCounts: updated.reactionCounts,
        viewerReaction: updated.viewerReaction,
      });
      patchInfiniteItem<Post>(queryClient, feedKey, updated.id, patch);
      patchInfiniteItem<Post>(queryClient, savedPostsKey, updated.id, patch);
      queryClient.setQueryData<Post>(postKey(updated.id), (current) =>
        current ? patch(current) : current,
      );
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation<Post, ApiError, { postId: string; input: UpdatePostInput }>({
    mutationFn: ({ postId, input }) =>
      apiRequest<Post>("patch", apiUrl("posts", postId), input),
    onSuccess: (updated) => {
      const patch = (post: Post): Post => ({
        ...post,
        content: updated.content,
        imageUrls: updated.imageUrls,
        visibility: updated.visibility,
      });
      patchInfiniteItem<Post>(queryClient, feedKey, updated.id, patch);
      patchInfiniteItem<Post>(queryClient, savedPostsKey, updated.id, patch);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (postId) => apiRequest<void>("delete", apiUrl("posts", postId)),
    onSuccess: (_data, postId) => {
      removeInfiniteItem<Post>(queryClient, feedKey, postId);
      removeInfiniteItem<Post>(queryClient, savedPostsKey, postId);
    },
  });
}
