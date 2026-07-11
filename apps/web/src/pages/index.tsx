import Head from "next/head";

import { HomeView } from "@/components/home/home-view";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Appifylab Social</title>
      </Head>
      <HomeView />
    </>
  );
}
