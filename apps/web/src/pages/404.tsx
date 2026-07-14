import Link from "next/link";

import { CommonButton } from "@repo/ui";

import { PageTitle } from "@/components/common/page-title";

export default function NotFoundPage() {
  return (
    <>
      <PageTitle title="Page Not Found" />
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <CommonButton asChild className="mt-2">
          <Link href="/">Back to home</Link>
        </CommonButton>
      </main>
    </>
  );
}
