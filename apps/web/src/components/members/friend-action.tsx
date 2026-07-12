import type { Member } from "@repo/library";
import { FriendStatus } from "@repo/library";
import { cn, CommonButton } from "@repo/ui";

import {
  useAcceptRequest,
  useRemoveFriend,
  useSendFriendRequest,
} from "@/hooks/use-friends";

export function FriendAction({
  member,
  fullWidth = false,
}: {
  member: Member;
  fullWidth?: boolean;
}) {
  const send = useSendFriendRequest();
  const accept = useAcceptRequest();
  const remove = useRemoveFriend();
  const wide = fullWidth ? "w-full" : undefined;

  switch (member.friendStatus) {
    case FriendStatus.FRIENDS:
      return (
        <CommonButton
          variant="outline"
          size="sm"
          className={wide}
          loading={remove.isPending}
          onClick={() => remove.mutate(member.id)}
        >
          Friends
        </CommonButton>
      );
    case FriendStatus.REQUEST_SENT:
      return (
        <CommonButton
          variant="secondary"
          size="sm"
          className={wide}
          loading={remove.isPending}
          onClick={() => remove.mutate(member.id)}
        >
          Cancel request
        </CommonButton>
      );
    case FriendStatus.REQUEST_RECEIVED:
      return (
        <div className={cn("flex gap-2", fullWidth && "w-full")}>
          <CommonButton
            size="sm"
            className={cn(fullWidth && "flex-1")}
            loading={accept.isPending}
            onClick={() => accept.mutate(member.id)}
          >
            Accept
          </CommonButton>
          <CommonButton
            variant="outline"
            size="sm"
            className={cn(fullWidth && "flex-1")}
            loading={remove.isPending}
            onClick={() => remove.mutate(member.id)}
          >
            Decline
          </CommonButton>
        </div>
      );
    default:
      return (
        <CommonButton
          size="sm"
          className={wide}
          loading={send.isPending}
          onClick={() => send.mutate(member.id)}
        >
          Add friend
        </CommonButton>
      );
  }
}
