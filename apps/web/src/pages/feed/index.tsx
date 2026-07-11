import Head from "next/head";

import { AppLayout } from "@/components/common/app-layout";
import { FeedView } from "@/components/feed/feed-view";
import type { NextPageWithLayout } from "@/pages/_app";

const FeedPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Feed | Appifylab Social</title>
      </Head>
      <FeedView />
    </>
  );
};

FeedPage.getLayout = (page) => <AppLayout fullHeight>{page}</AppLayout>;

export default FeedPage;
