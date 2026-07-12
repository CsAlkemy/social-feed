import type { Page } from "@repo/library";
import type { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";

export function patchInfiniteItem<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
  patch: (item: T) => T,
): void {
  queryClient.setQueryData<InfiniteData<Page<T>>>(queryKey, (data) => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((item) => (item.id === id ? patch(item) : item)),
      })),
    };
  });
}

export function removeInfiniteItem<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
): void {
  queryClient.setQueryData<InfiniteData<Page<T>>>(queryKey, (data) => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.filter((item) => item.id !== id),
      })),
    };
  });
}
