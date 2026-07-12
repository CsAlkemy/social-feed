import Link from "next/link";
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

import { Card } from "@repo/ui";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  soon?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Learning", icon: CirclePlayIcon, soon: true },
  { label: "Insights", icon: ChartColumnIcon, soon: true },
  { label: "Find friends", icon: UserPlusIcon, href: "/members" },
  { label: "Bookmarks", icon: BookmarkIcon, soon: true },
  { label: "Group", icon: UsersIcon, soon: true },
  { label: "Gaming", icon: Gamepad2Icon, soon: true },
  { label: "Settings", icon: SettingsIcon, soon: true },
  { label: "Save post", icon: SaveIcon, soon: true },
];

const ROW_CLASS =
  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors";

export function ExploreMenu() {
  return (
    <Card className="p-3">
      <h2 className="px-3 pb-1 pt-2 text-lg font-semibold">Explore</h2>

      <nav aria-label="Explore">
        {MENU_ITEMS.map(({ label, icon: Icon, href, soon }) => {
          const content = (
            <>
              <Icon className="size-5 text-muted-foreground" />
              <span>{label}</span>
              {soon ? (
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  Soon
                </span>
              ) : null}
            </>
          );

          if (soon || !href) {
            return (
              <div
                key={label}
                aria-disabled="true"
                className={`${ROW_CLASS} cursor-not-allowed text-muted-foreground opacity-60`}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={`${ROW_CLASS} text-foreground hover:bg-secondary`}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
