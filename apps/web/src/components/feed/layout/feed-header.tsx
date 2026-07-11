import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ReactNode } from "react";

import {
  BellIcon,
  ChevronDownIcon,
  HomeIcon,
  MessageCircleIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";

import type { User } from "@repo/library";
import {
  cn,
  CommonDropdown,
  SearchInput,
  UserAvatar,
  toast,
  type CommonDropdownItem,
} from "@repo/ui";

import { useLogout } from "@/hooks/use-auth";

interface NavIconButtonProps {
  label: string;
  icon: ReactNode;
  badgeCount?: number;
  className?: string;
}

function NavIconButton({ label, icon, badgeCount, className }: NavIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => toast.info(`${label} is not connected yet`)}
      className={cn(
        "flex h-16 items-center px-2 text-muted-foreground transition-colors hover:text-primary sm:px-2.5",
        className,
      )}
    >
      <span className="relative flex">
        {icon}
        {badgeCount === undefined ? null : (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {badgeCount}
          </span>
        )}
      </span>
    </button>
  );
}

export function FeedHeader({ user }: { user: User }) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const logout = useLogout();
  const fullName = `${user.firstName} ${user.lastName}`;

  const accountMenuItems: CommonDropdownItem[] = [
    { label: "View profile", onSelect: () => void router.push("/profile") },
    { label: "Settings", disabled: true },
    { label: "Help & Support", disabled: true },
    { type: "separator" },
    {
      label: "Log out",
      destructive: true,
      onSelect: () => logout.mutate(),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/feed" aria-label="BuddyScript home" className="shrink-0">
          <Image
            src="/images/logo-copy.svg"
            alt="Buddy Script"
            width={20}
            height={24}
            priority
            className="sm:hidden"
          />
          <Image
            src="/images/logo.svg"
            alt="Buddy Script"
            width={158}
            height={33}
            priority
            className="hidden sm:block"
          />
        </Link>

        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={() => toast.info("Search is not connected yet")}
          placeholder="input search text"
          containerClassName="hidden w-full max-w-105 md:block"
        />

        <nav aria-label="Primary" className="ml-auto flex items-center">
          <NavIconButton
            label="Search"
            icon={<SearchIcon className="size-5" />}
            className="md:hidden"
          />
          <Link
            href="/feed"
            aria-label="Home"
            aria-current="page"
            className="relative flex h-16 items-center px-2 text-primary sm:px-2.5"
          >
            <HomeIcon className="size-5" />
            <span aria-hidden className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
          </Link>
          <NavIconButton label="Friends" icon={<UsersIcon className="size-5" />} />
          <NavIconButton label="Notifications" icon={<BellIcon className="size-5" />} badgeCount={6} />
          <NavIconButton label="Messages" icon={<MessageCircleIcon className="size-5" />} badgeCount={2} />
        </nav>

        <CommonDropdown
          trigger={
            <button
              type="button"
              aria-label="Open account menu"
              className="flex shrink-0 items-center gap-2"
            >
              <UserAvatar name={fullName} src={user.avatarUrl} className="size-8 sm:size-9" />
              <span className="hidden text-sm font-medium sm:block">{fullName}</span>
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            </button>
          }
          items={accountMenuItems}
        />
      </div>
    </header>
  );
}
