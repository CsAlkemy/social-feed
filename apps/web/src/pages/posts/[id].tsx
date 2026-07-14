import { useRouter } from "next/router";

import { AppLayout } from "@/components/common/app-layout";
import { PageTitle } from "@/components/common/page-title";
import { PostPermalink } from "@/components/feed/posts/post-permalink";
import type { NextPageWithLayout } from "@/pages/_app";

const PostPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  return (
    <>
      <PageTitle title="Post" />
      {id ? <PostPermalink id={id} /> : null}
    </>
  );
};

PostPage.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default PostPage;
