import type { ApiError, CreateEventInput, Event, Page } from "@repo/library";
import { apiRequest, apiUrl } from "@repo/library/apis";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { patchInfiniteItem } from "@/hooks/infinite-cache";

export const eventsKey = ["events"] as const;

export function useEvents(limit = 10) {
  return useInfiniteQuery({
    queryKey: eventsKey,
    queryFn: ({ pageParam }) =>
      apiRequest<Page<Event>>(
        "get",
        `${apiUrl("events")}?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<Event, ApiError, CreateEventInput>({
    mutationFn: (input) => apiRequest<Event>("post", apiUrl("events"), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsKey }),
  });
}

export function useEventAttendance() {
  const queryClient = useQueryClient();

  return useMutation<Event, ApiError, { event: Event; going: boolean }>({
    mutationFn: ({ event, going }) =>
      going
        ? apiRequest<Event>("put", apiUrl("events", `${event.id}/attendance`))
        : apiRequest<Event>("delete", apiUrl("events", `${event.id}/attendance`)),
    onSuccess: (updated) =>
      patchInfiniteItem<Event>(queryClient, eventsKey, updated.id, (current) => ({
        ...current,
        goingCount: updated.goingCount,
        viewerGoing: updated.viewerGoing,
      })),
  });
}
