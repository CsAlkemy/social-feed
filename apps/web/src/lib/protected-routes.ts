export const PROTECTED_ROUTES = [
  "/feed",
  "/posts",
  "/members",
  "/events",
  "/saved",
  "/profile",
];

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
