import { AppLayout } from "@/components/common/app-layout";
import { PageTitle } from "@/components/common/page-title";
import { ProfileComponent } from "@/components/profile";
import type { NextPageWithLayout } from "@/pages/_app";

const ProfilePage: NextPageWithLayout = () => {
  return (
    <>
      <PageTitle title="Profile" />
      <ProfileComponent />
    </>
  );
};

ProfilePage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default ProfilePage;
