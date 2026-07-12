import type {
  ApiError,
  CreateStoryInput,
  Page,
  Story,
  StoryGroup,
  StoryViewer,
} from "@repo/library";
import { apiRequest, apiUrl } from "@repo/library/apis";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const storiesKey = ["stories"] as const;

export function useStories() {
  return useQuery<StoryGroup[], ApiError>({
    queryKey: storiesKey,
    queryFn: () => apiRequest<StoryGroup[]>("get", apiUrl("stories")),
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation<Story, ApiError, CreateStoryInput>({
    mutationFn: (input) => apiRequest<Story>("post", apiUrl("stories"), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storiesKey }),
  });
}

export function useViewStory() {
  const queryClient = useQueryClient();

  return useMutation<Story, ApiError, string>({
    mutationFn: (storyId) =>
      apiRequest<Story>("post", apiUrl("stories", `${storyId}/view`)),
    onSuccess: (updated) => {
      queryClient.setQueryData<StoryGroup[]>(storiesKey, (groups) =>
        groups?.map((group) => {
          if (group.author.id !== updated.author.id) return group;
          const stories = group.stories.map((story) =>
            story.id === updated.id ? { ...story, viewed: true } : story,
          );
          return { ...group, stories, hasUnseen: stories.some((s) => !s.viewed) };
        }),
      );
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (storyId) => apiRequest<void>("delete", apiUrl("stories", storyId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storiesKey }),
  });
}

export function useStoryViewers(storyId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["stories", storyId, "viewers"],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: "20" });
      if (pageParam) params.set("cursor", pageParam);
      return apiRequest<Page<StoryViewer>>(
        "get",
        `${apiUrl("stories", `${storyId}/viewers`)}?${params.toString()}`,
      );
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
}
