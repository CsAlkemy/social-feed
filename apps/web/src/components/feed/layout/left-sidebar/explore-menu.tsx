import {
  BookmarkIcon,
  ChartColumnIcon,
  CirclePlayIcon,
  Gamepad2Icon,
  SaveIcon,
  SettingsIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { Card, toast } from "@repo/ui";

const MENU_ITEMS: Array<{ label: string; icon: LucideIcon; isNew?: boolean }> = [
  { label: "Learning", icon: CirclePlayIcon, isNew: true },
  { label: "Insights", icon: ChartColumnIcon },
  { label: "Find friends", icon: UserPlusIcon },
  { label: "Bookmarks", icon: BookmarkIcon },
  { label: "Group", icon: UsersIcon },
  { label: "Gaming", icon: Gamepad2Icon, isNew: true },
  { label: "Settings", icon: SettingsIcon },
  { label: "Save post", icon: SaveIcon },
];

export function ExploreMenu() {
  return (
    <Card className="p-3">
      <h2 className="px-3 pb-1 pt-2 text-lg font-semibold">Explore</h2>

      <nav aria-label="Explore">
        {MENU_ITEMS.map(({ label, icon: Icon, isNew }) => (
          <button
            key={label}
            type="button"
            onClick={() => toast.info(`${label} is not connected yet`)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Icon className="size-5 text-muted-foreground" />
            <span>{label}</span>
            {isNew ? (
              <span className="ml-auto rounded bg-success px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                New
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </Card>
  );
}
