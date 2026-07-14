import Head from "next/head";

export const PageTitle = ({ title }: { title: string }) => {
  return (
    <Head>
      <title>{`${title} | Appifylab Social`}</title>
    </Head>
  );
};
