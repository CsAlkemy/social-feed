import type { Member, Page } from "@repo/library";
import { Card, CommonButton, Spinner } from "@repo/ui";
import type { InfiniteData } from "@tanstack/react-query";

import { MemberCard } from "@/components/members/member-card";

type MembersQuery = {
  data?: InfiniteData<Page<Member>>;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => unknown;
  fetchNextPage: () => unknown;
};

export function MemberGrid({
  query,
  emptyMessage,
}: {
  query: MembersQuery;
  emptyMessage: string;
}) {
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        <p>Something went wrong.</p>
        <CommonButton
          variant="outline"
          className="mt-3"
          onClick={() => void query.refetch()}
        >
          Try again
        </CommonButton>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
      {query.hasNextPage ? (
        <div className="flex justify-center pt-2">
          <CommonButton
            variant="outline"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            Load more
          </CommonButton>
        </div>
      ) : null}
    </>
  );
}
