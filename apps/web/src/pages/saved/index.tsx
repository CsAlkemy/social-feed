import Head from "next/head";

import { AppLayout } from "@/components/common/app-layout";
import { SavedView } from "@/components/saved/saved-view";
import type { NextPageWithLayout } from "@/pages/_app";

const SavedPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Saved Posts | Appifylab Social</title>
      </Head>
      <SavedView />
    </>
  );
};

SavedPage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default SavedPage;
