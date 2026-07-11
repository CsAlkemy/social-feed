import Head from "next/head";
import Link from "next/link";

import { Button } from "@repo/ui/schadcn/button";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Appifylab Social</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-900">Appifylab Social</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/registration">Registration</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/feed">Feed</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
