import { useEffect } from "react";

import type {
  Comment,
  CommentChangeEvent,
  CommentReactionEvent,
  Post,
  PostReactionEvent,
} from "@repo/library";
import { getValidAccessToken } from "@repo/library/apis";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";

import { patchInfiniteItem, removeInfiniteItem } from "@/hooks/infinite-cache";
import { commentsKey, repliesKey } from "@/hooks/use-comments";
import { feedKey, postKey, savedPostsKey } from "@/hooks/use-posts";

let socket: Socket | null = null;
let everConnected = false;

function socketUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return explicit;
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api?.startsWith("http")) return new URL(api).origin;
  return null;
}

function getSocket(): Socket | null {
  const url = socketUrl();
  if (!url) return null;
  socket ??= io(url, {
    transports: ["websocket"],
    auth: (callback) => {
      void getValidAccessToken().then((token) => callback({ token }));
    },
  });
  return socket;
}

export function disconnectRealtime(): void {
  socket?.disconnect();
  socket = null;
  everConnected = false;
}

function patchPost(
  queryClient: QueryClient,
  postId: string,
  patch: (post: Post) => Post,
): void {
  patchInfiniteItem<Post>(queryClient, feedKey, postId, patch);
  patchInfiniteItem<Post>(queryClient, savedPostsKey, postId, patch);
  queryClient.setQueryData<Post>(postKey(postId), (current) =>
    current ? patch(current) : current,
  );
}

export function useRealtime(enabled: boolean): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const client = getSocket();
    if (!client) return;

    const handleConnect = () => {
      if (everConnected) {
        void queryClient.invalidateQueries({ queryKey: feedKey });
      }
      everConnected = true;
    };

    const handlePostReaction = (event: PostReactionEvent) => {
      patchPost(queryClient, event.postId, (post) => ({
        ...post,
        likeCount: event.likeCount,
        reactionCounts: event.reactionCounts,
      }));
    };

    const handleCommentReaction = (event: CommentReactionEvent) => {
      const key = event.parentId
        ? repliesKey(event.parentId)
        : commentsKey(event.postId);
      patchInfiniteItem<Comment>(queryClient, key, event.commentId, (comment) => ({
        ...comment,
        likeCount: event.likeCount,
        reactionCounts: event.reactionCounts,
      }));
    };

    const handleCommentCreated = (event: CommentChangeEvent) => {
      patchPost(queryClient, event.postId, (post) => ({
        ...post,
        commentCount: event.postCommentCount,
      }));
      if (event.parentId) {
        patchInfiniteItem<Comment>(
          queryClient,
          commentsKey(event.postId),
          event.parentId,
          (comment) => ({
            ...comment,
            replyCount: event.parentReplyCount ?? comment.replyCount,
          }),
        );
        void queryClient.invalidateQueries({
          queryKey: repliesKey(event.parentId),
        });
      } else {
        void queryClient.invalidateQueries({
          queryKey: commentsKey(event.postId),
        });
      }
    };

    const handleCommentDeleted = (event: CommentChangeEvent) => {
      patchPost(queryClient, event.postId, (post) => ({
        ...post,
        commentCount: event.postCommentCount,
      }));
      if (event.parentId) {
        removeInfiniteItem<Comment>(
          queryClient,
          repliesKey(event.parentId),
          event.commentId,
        );
        patchInfiniteItem<Comment>(
          queryClient,
          commentsKey(event.postId),
          event.parentId,
          (comment) => ({
            ...comment,
            replyCount: event.parentReplyCount ?? comment.replyCount,
          }),
        );
      } else {
        removeInfiniteItem<Comment>(
          queryClient,
          commentsKey(event.postId),
          event.commentId,
        );
      }
    };

    client.on("connect", handleConnect);
    client.on("post:reaction", handlePostReaction);
    client.on("comment:reaction", handleCommentReaction);
    client.on("comment:created", handleCommentCreated);
    client.on("comment:deleted", handleCommentDeleted);

    return () => {
      client.off("connect", handleConnect);
      client.off("post:reaction", handlePostReaction);
      client.off("comment:reaction", handleCommentReaction);
      client.off("comment:created", handleCommentCreated);
      client.off("comment:deleted", handleCommentDeleted);
    };
  }, [enabled, queryClient]);
}
