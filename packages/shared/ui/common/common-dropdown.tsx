import * as React from "react";

import { cn } from "../lib/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../schadcn/dropdown-menu";

export type CommonDropdownItem =
  | {
      type?: "item";
      id?: string;
      label: React.ReactNode;
      icon?: React.ReactNode;
      onSelect?: (event: Event) => void;
      destructive?: boolean;
      disabled?: boolean;
    }
  | { type: "separator" }
  | { type: "label"; label: React.ReactNode };

export interface CommonDropdownProps {
  trigger: React.ReactNode;
  items: CommonDropdownItem[];
  align?: "start" | "center" | "end";
  contentClassName?: string;
}

export function CommonDropdown({
  trigger,
  items,
  align = "end",
  contentClassName,
}: CommonDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={contentClassName}>
        {items.map((item, index) => {
          if (item.type === "separator") {
            return <DropdownMenuSeparator key={index} />;
          }

          if (item.type === "label") {
            return <DropdownMenuLabel key={index}>{item.label}</DropdownMenuLabel>;
          }

          return (
            <DropdownMenuItem
              key={item.id ?? index}
              disabled={item.disabled}
              onSelect={item.onSelect}
              className={cn(
                item.destructive && "text-destructive focus:bg-destructive/10 focus:text-destructive",
              )}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
