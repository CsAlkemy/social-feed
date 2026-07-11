import Head from "next/head";

import { FeedView } from "@/components/feed/feed-view";

export default function FeedPage() {
  return (
    <>
      <Head>
        <title>Feed | Appifylab Social</title>
      </Head>
      <FeedView />
    </>
  );
}
