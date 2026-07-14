import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";

import { Spinner } from "@repo/ui";

import { useSession } from "@/hooks/use-auth";
import { isProtectedRoute } from "@/lib/protected-routes";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useSession();

  const protectedRoute = isProtectedRoute(router.pathname);
  const authRoute = router.pathname.startsWith("/auth");

  useEffect(() => {
    if (isLoading) return;
    if (protectedRoute && !user) {
      void router.replace("/auth/login");
    } else if (authRoute && user) {
      void router.replace("/feed");
    }
  }, [isLoading, user, protectedRoute, authRoute, router]);

  if (protectedRoute && (isLoading || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
