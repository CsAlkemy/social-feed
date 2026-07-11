import type { ReactNode } from "react";

import { cn } from "@repo/ui";

import { AppHeader } from "@/components/common/app-header";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useSession } from "@/hooks/use-auth";

export function AppLayout({
  children,
  fullHeight = false,
}: {
  children: ReactNode;
  fullHeight?: boolean;
}) {
  const { user } = useSession();

  if (!user) return null;

  return (
    <div className={cn("flex flex-col bg-background", fullHeight ? "h-screen" : "min-h-screen")}>
      <AppHeader user={user} />
      {children}
      <ThemeToggle />
    </div>
  );
}
