import Link from "next/link";

import { Button } from "@repo/ui";

export function HomeView() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-card-foreground">Appifylab Social</h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button asChild>
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/registration">Registration</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/feed">Feed</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/components-preview">Components preview</Link>
        </Button>
      </div>
    </main>
  );
}
