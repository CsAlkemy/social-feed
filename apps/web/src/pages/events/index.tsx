import Head from "next/head";

import { AppLayout } from "@/components/common/app-layout";
import { EventsView } from "@/components/events/events-view";
import type { NextPageWithLayout } from "@/pages/_app";

const EventsPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Events | Appifylab Social</title>
      </Head>
      <EventsView />
    </>
  );
};

EventsPage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default EventsPage;
