import { AppLayout } from "@/components/common/app-layout";
import { PageTitle } from "@/components/common/page-title";
import { SavedView } from "@/components/saved/saved-view";
import type { NextPageWithLayout } from "@/pages/_app";

const SavedPage: NextPageWithLayout = () => {
  return (
    <>
      <PageTitle title="Saved Posts" />
      <SavedView />
    </>
  );
};

SavedPage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default SavedPage;
