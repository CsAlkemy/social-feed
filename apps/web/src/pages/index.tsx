import Head from "next/head";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Appifylab Social</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-900">Appifylab Social</h1>
        <div className="flex gap-4">
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </Link>
          <Link href="/auth/registration" className="text-blue-600 hover:underline">
            Registration
          </Link>
          <Link href="/feed" className="text-blue-600 hover:underline">
            Feed
          </Link>
        </div>
      </main>
    </>
  );
}
