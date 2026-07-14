import Link from "next/link";

import { CommonButton } from "@repo/ui";

import { PageTitle } from "@/components/common/page-title";

export default function ServerErrorPage() {
  return (
    <>
      <PageTitle title="Something Went Wrong" />
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-7xl font-bold text-primary">500</p>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred on our end. Please try again in a
          moment.
        </p>
        <CommonButton asChild className="mt-2">
          <Link href="/">Back to home</Link>
        </CommonButton>
      </main>
    </>
  );
}
