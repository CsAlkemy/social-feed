import type {
  ApiError,
  Comment,
  CreateCommentInput,
  Page,
  ReactionType,
} from "@repo/library";
import { apiRequest, apiUrl } from "@repo/library/apis";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";

import { applyReaction } from "@/hooks/apply-reaction";
import { patchInfiniteItem, removeInfiniteItem } from "@/hooks/infinite-cache";
import { feedKey, postKey } from "@/hooks/use-posts";

export const commentsKey = (postId: string) =>
  ["posts", postId, "comments"] as const;
export const repliesKey = (commentId: string) =>
  ["comments", commentId, "replies"] as const;

export function useComments(postId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: commentsKey(postId),
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Comment>>(
        "get",
        `${apiUrl("posts", `${postId}/comments`)}?limit=10${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
}

export function useReplies(commentId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: repliesKey(commentId),
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Comment>>(
        "get",
        `${apiUrl("comments", `${commentId}/replies`)}?limit=10${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<Comment, ApiError, CreateCommentInput>({
    mutationFn: (input) =>
      apiRequest<Comment>("post", apiUrl("posts", `${postId}/comments`), input),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: feedKey });
      void queryClient.invalidateQueries({ queryKey: postKey(postId) });
      if (created.parentId) {
        void queryClient.invalidateQueries({
          queryKey: repliesKey(created.parentId),
        });
        patchInfiniteItem<Comment>(
          queryClient,
          commentsKey(postId),
          created.parentId,
          (comment) => ({ ...comment, replyCount: comment.replyCount + 1 }),
        );
      } else {
        void queryClient.invalidateQueries({ queryKey: commentsKey(postId) });
      }
    },
  });
}

export function useReactToComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Comment,
    ApiError,
    { comment: Comment; reaction: ReactionType | null },
    { key: QueryKey; previous?: InfiniteData<Page<Comment>> }
  >({
    mutationFn: ({ comment, reaction }) =>
      reaction
        ? apiRequest<Comment>("put", apiUrl("comments", `${comment.id}/reaction`), {
            type: reaction,
          })
        : apiRequest<Comment>("delete", apiUrl("comments", `${comment.id}/reaction`)),
    onMutate: async ({ comment, reaction }) => {
      const key = comment.parentId
        ? repliesKey(comment.parentId)
        : commentsKey(postId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<InfiniteData<Page<Comment>>>(key);
      patchInfiniteItem<Comment>(queryClient, key, comment.id, (current) =>
        applyReaction(current, reaction),
      );
      return { key, previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSuccess: (updated) => {
      const key = updated.parentId
        ? repliesKey(updated.parentId)
        : commentsKey(postId);
      patchInfiniteItem<Comment>(queryClient, key, updated.id, (current) => ({
        ...current,
        likeCount: updated.likeCount,
        reactionCounts: updated.reactionCounts,
        viewerReaction: updated.viewerReaction,
      }));
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, Comment>({
    mutationFn: (comment) => apiRequest<void>("delete", apiUrl("comments", comment.id)),
    onSuccess: (_data, comment) => {
      void queryClient.invalidateQueries({ queryKey: feedKey });
      void queryClient.invalidateQueries({ queryKey: postKey(postId) });
      if (comment.parentId) {
        removeInfiniteItem<Comment>(
          queryClient,
          repliesKey(comment.parentId),
          comment.id,
        );
        patchInfiniteItem<Comment>(
          queryClient,
          commentsKey(postId),
          comment.parentId,
          (current) => ({
            ...current,
            replyCount: Math.max(0, current.replyCount - 1),
          }),
        );
      } else {
        removeInfiniteItem<Comment>(queryClient, commentsKey(postId), comment.id);
        void queryClient.invalidateQueries({ queryKey: repliesKey(comment.id) });
      }
    },
  });
}
