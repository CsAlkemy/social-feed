import * as React from "react";

import { cn } from "../lib/cn";
import { Avatar, AvatarFallback, AvatarImage } from "../schadcn/avatar";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export interface UserAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ name, src, className, fallbackClassName }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback className={cn(fallbackClassName)}>{initialsOf(name)}</AvatarFallback>
    </Avatar>
  );
}
