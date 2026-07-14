import { AppLayout } from "@/components/common/app-layout";
import { PageTitle } from "@/components/common/page-title";
import { EventsView } from "@/components/events/events-view";
import type { NextPageWithLayout } from "@/pages/_app";

const EventsPage: NextPageWithLayout = () => {
  return (
    <>
      <PageTitle title="Events" />
      <EventsView />
    </>
  );
};

EventsPage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default EventsPage;
