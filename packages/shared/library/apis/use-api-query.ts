import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";

import type { ApiError } from "../functions/api-error";
import { apiRequest, apiUrl } from "./client";

export function useApiQuery<T>(
  apiModule: string,
  lastUrl?: string,
  options?: Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn">,
) {
  const query = useQuery<T, ApiError>({
    queryKey: [apiModule, lastUrl],
    queryFn: () => apiRequest<T>("get", apiUrl(apiModule, lastUrl)),
    ...options,
  });

  return { ...query, refresh: query.refetch };
}
