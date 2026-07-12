import type { Member } from "@repo/library";
import { Card, UserAvatar } from "@repo/ui";

import { FriendAction } from "@/components/members/friend-action";

export function MemberCard({ member }: { member: Member }) {
  const name = `${member.firstName} ${member.lastName}`;

  return (
    <Card className="flex flex-col items-center gap-3 p-5 text-center">
      <UserAvatar name={name} src={member.avatarUrl} className="size-16" />
      <div className="w-full min-w-0">
        <p className="truncate text-sm font-medium text-card-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>
      <FriendAction member={member} />
    </Card>
  );
}
