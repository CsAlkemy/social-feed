import type { User } from "@repo/library";

export interface AuthResponse {
  user: User;
  accessToken: string;
}

const AUTH_HINT = "authed";

export function setAuthHint(authed: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = authed
    ? `${AUTH_HINT}=1; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
    : `${AUTH_HINT}=; path=/; max-age=0; samesite=lax`;
}
