import { AppLayout } from "@/components/common/app-layout";
import { PageTitle } from "@/components/common/page-title";
import { MembersView } from "@/components/members/members-view";
import type { NextPageWithLayout } from "@/pages/_app";

const MembersPage: NextPageWithLayout = () => {
  return (
    <>
      <PageTitle title="People" />
      <MembersView />
    </>
  );
};

MembersPage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default MembersPage;
