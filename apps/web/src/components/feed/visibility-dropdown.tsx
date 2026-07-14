import { ChevronDownIcon, GlobeIcon, LockIcon } from "lucide-react";

import { PostVisibility } from "@repo/library";
import { cn, CommonDropdown } from "@repo/ui";

const VISIBILITY_OPTIONS = [
  {
    value: PostVisibility.PUBLIC,
    label: "Public",
    hint: "Anyone can see this post",
    icon: GlobeIcon,
  },
  {
    value: PostVisibility.PRIVATE,
    label: "Private",
    hint: "Only you can see this post",
    icon: LockIcon,
  },
] as const;

export function VisibilityDropdown({
  value,
  onChange,
  triggerClassName,
  labelClassName,
}: {
  value: PostVisibility;
  onChange: (value: PostVisibility) => void;
  triggerClassName?: string;
  labelClassName?: string;
}) {
  const active =
    VISIBILITY_OPTIONS.find((option) => option.value === value) ?? VISIBILITY_OPTIONS[0];

  return (
    <CommonDropdown
      trigger={
        <button
          type="button"
          aria-label={`Post visibility: ${active.label}`}
          className={cn(
            "flex items-center gap-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            triggerClassName,
          )}
        >
          <active.icon className="size-4" />
          <span className={labelClassName}>{active.label}</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </button>
      }
      items={VISIBILITY_OPTIONS.map(({ value: option, label, hint, icon: Icon }) => ({
        icon: <Icon className="size-4" />,
        label: (
          <span className="flex flex-col">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">{hint}</span>
          </span>
        ),
        onSelect: () => onChange(option),
      }))}
    />
  );
}
