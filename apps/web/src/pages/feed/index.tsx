import { AppLayout } from "@/components/common/app-layout";
import { PageTitle } from "@/components/common/page-title";
import { FeedView } from "@/components/feed/feed-view";
import type { NextPageWithLayout } from "@/pages/_app";

const FeedPage: NextPageWithLayout = () => {
  return (
    <>
      <PageTitle title="Feed" />
      <FeedView />
    </>
  );
};

FeedPage.getLayout = (page) => <AppLayout fullHeight>{page}</AppLayout>;

export default FeedPage;
