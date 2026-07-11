import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../functions/api-error";
import { apiRequest, apiUrl } from "./client";

export type ListFilter = Record<string, string | number | undefined>;

export interface UseListApiQueryParams {
  apiModule: string;
  lastUrl?: string;
  filter?: ListFilter;
  limit?: number;
  sort?: string;
}

export function useListApiQuery<T>({
  apiModule,
  lastUrl,
  filter = {},
  limit,
  sort,
}: UseListApiQueryParams) {
  const [listState, setListState] = useState({ filter, limit, sort });

  const search = new URLSearchParams();
  const params = { ...listState.filter, limit: listState.limit, sort: listState.sort };
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.append(key, String(value));
  }
  const queryString = search.toString();

  const query = useQuery<T, ApiError>({
    queryKey: [apiModule, lastUrl, listState],
    queryFn: () =>
      apiRequest<T>(
        "get",
        `${apiUrl(apiModule, lastUrl)}${queryString ? `?${queryString}` : ""}`,
      ),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    listState,
    filterOnChange: (patch: ListFilter) =>
      setListState((state) => ({ ...state, filter: { ...state.filter, ...patch } })),
    sortOnChange: (nextSort: string) =>
      setListState((state) => ({ ...state, sort: nextSort })),
    refresh: query.refetch,
  };
}
