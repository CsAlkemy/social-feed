import type { User } from "@repo/library";

export interface AuthResponse {
  user: User;
  accessToken: string;
}

const AUTH_HINT = "authed";
// Keep in sync with the API's REFRESH_TOKEN_TTL_DAYS so the middleware hint
// expires alongside the refresh token.
const AUTH_HINT_TTL_DAYS = Number(process.env.NEXT_PUBLIC_REFRESH_TTL_DAYS ?? 7);

export function setAuthHint(authed: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = authed
    ? `${AUTH_HINT}=1; path=/; max-age=${60 * 60 * 24 * AUTH_HINT_TTL_DAYS}; samesite=lax`
    : `${AUTH_HINT}=; path=/; max-age=0; samesite=lax`;
}
