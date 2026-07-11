import { SearchIcon, XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Input } from "../schadcn/input";

export interface SearchInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  containerClassName,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        role="searchbox"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSearch?.(value);
          }
        }}
        placeholder={placeholder}
        className={cn("h-11 rounded-[18px] bg-secondary pl-11 pr-11", className)}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
