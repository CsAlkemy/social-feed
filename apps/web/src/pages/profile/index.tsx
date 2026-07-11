import Head from "next/head";

import { ProfileComponent } from "@/components/profile";

export default function ProfilePage() {
  return (
    <>
      <Head>
        <title>Profile | Appifylab Social</title>
      </Head>
      <ProfileComponent />
    </>
  );
}
