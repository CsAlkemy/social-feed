import Head from "next/head";

import { AppLayout } from "@/components/common/app-layout";
import { MembersView } from "@/components/members/members-view";
import type { NextPageWithLayout } from "@/pages/_app";

const MembersPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>People | Appifylab Social</title>
      </Head>
      <MembersView />
    </>
  );
};

MembersPage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default MembersPage;
