import type { ApiError, Member, Page, SendFriendRequestInput } from "@repo/library";
import { FriendStatus } from "@repo/library";
import { apiRequest, apiUrl } from "@repo/library/apis";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

export const membersKey = (search: string) =>
  ["members", "directory", search] as const;
export const suggestionsKey = ["members", "suggestions"] as const;
export const friendsKey = ["friends", "list"] as const;
export const requestsKey = (direction: "incoming" | "outgoing") =>
  ["friends", "requests", direction] as const;

export function useMembers(search: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: membersKey(search),
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Member>>(
        "get",
        `${apiUrl("users")}?limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useSuggestions(limit = 5) {
  return useInfiniteQuery({
    queryKey: suggestionsKey,
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Member>>(
        "get",
        `${apiUrl("users", "suggestions")}?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useFriends(limit = 20) {
  return useInfiniteQuery({
    queryKey: friendsKey,
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Member>>(
        "get",
        `${apiUrl("friends")}?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useFriendRequests(
  direction: "incoming" | "outgoing" = "incoming",
  limit = 20,
) {
  return useInfiniteQuery({
    queryKey: requestsKey(direction),
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Member>>(
        "get",
        `${apiUrl("friends", "requests")}?direction=${direction}&limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

function patchMemberStatus(
  queryClient: QueryClient,
  userId: string,
  friendStatus: FriendStatus,
): void {
  queryClient.setQueriesData<InfiniteData<Page<Member>>>(
    {
      predicate: (query) => {
        const scope = query.queryKey[0];
        return scope === "members" || scope === "friends";
      },
    },
    (data) => {
      if (!data) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((member) =>
            member.id === userId ? { ...member, friendStatus } : member,
          ),
        })),
      };
    },
  );
}

function reconcileMemberLists(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: suggestionsKey });
  void queryClient.invalidateQueries({ queryKey: friendsKey });
  void queryClient.invalidateQueries({ queryKey: ["friends", "requests"] });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation<Member, ApiError, string>({
    mutationFn: (userId) =>
      apiRequest<Member>("post", apiUrl("friends", "requests"), {
        userId,
      } satisfies SendFriendRequestInput),
    onMutate: (userId) =>
      patchMemberStatus(queryClient, userId, FriendStatus.REQUEST_SENT),
    onSuccess: (member) =>
      patchMemberStatus(queryClient, member.id, member.friendStatus),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onSettled: () => reconcileMemberLists(queryClient),
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation<Member, ApiError, string>({
    mutationFn: (userId) =>
      apiRequest<Member>("post", apiUrl("friends", `requests/${userId}/accept`)),
    onMutate: (userId) =>
      patchMemberStatus(queryClient, userId, FriendStatus.FRIENDS),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onSettled: () => reconcileMemberLists(queryClient),
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (userId) => apiRequest<void>("delete", apiUrl("friends", userId)),
    onMutate: (userId) =>
      patchMemberStatus(queryClient, userId, FriendStatus.NONE),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onSettled: () => reconcileMemberLists(queryClient),
  });
}
