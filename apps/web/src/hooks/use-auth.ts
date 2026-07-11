import { useRouter } from "next/router";

import type { User } from "@repo/library";
import { apiRequest, apiUrl, setAccessToken } from "@repo/library/apis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { setAuthHint, type AuthResponse } from "@/lib/auth";

export const sessionKey = ["session"] as const;

export function useSession() {
  const query = useQuery<User | null>({
    queryKey: sessionKey,
    queryFn: async () => {
      try {
        const { user, accessToken } = await apiRequest<AuthResponse>(
          "post",
          apiUrl("auth", "refresh"),
        );
        setAccessToken(accessToken);
        setAuthHint(true);
        return user;
      } catch {
        setAccessToken(null);
        setAuthHint(false);
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });

  return {
    user: query.data ?? null,
    isAuthenticated: Boolean(query.data),
    isLoading: query.isLoading,
  };
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiRequest<void>("post", apiUrl("auth", "logout")),
    onSettled: () => {
      setAccessToken(null);
      setAuthHint(false);
      queryClient.clear();
      void router.replace("/auth/login");
    },
  });
}
