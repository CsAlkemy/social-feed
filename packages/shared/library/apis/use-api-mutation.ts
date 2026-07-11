import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

import type { ApiError } from "../functions/api-error";
import { apiRequest, apiUrl, type ApiMethod } from "./client";

export interface ApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn"> {
  invalidate?: QueryKey[];
}

export function useApiMutation<TData = unknown, TVariables = void>(
  apiModule: string,
  lastUrl?: string | ((variables: TVariables) => string),
  method: ApiMethod = "post",
  options: ApiMutationOptions<TData, TVariables> = {},
) {
  const { invalidate, onSuccess, ...rest } = options;
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, ApiError, TVariables>({
    ...rest,
    mutationFn: (variables) => {
      const last = typeof lastUrl === "function" ? lastUrl(variables) : lastUrl;
      const body = method === "get" || method === "delete" ? undefined : variables;
      return apiRequest<TData>(method, apiUrl(apiModule, last), body);
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (invalidate?.length) {
        await Promise.all(
          invalidate.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }
      await onSuccess?.(data, variables, onMutateResult, context);
    },
  });

  return { ...mutation, isLoading: mutation.isPending };
}
