import Head from "next/head";

import { AppLayout } from "@/components/common/app-layout";
import { ProfileComponent } from "@/components/profile";
import type { NextPageWithLayout } from "@/pages/_app";

const ProfilePage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Profile | Appifylab Social</title>
      </Head>
      <ProfileComponent />
    </>
  );
};

ProfilePage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default ProfilePage;
