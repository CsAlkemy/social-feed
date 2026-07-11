import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CircleIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Checkbox semantics with the design's round radio-style look.
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer aspect-square size-4 shrink-0 rounded-full border border-input bg-card transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <CircleIcon className="size-2.5 fill-primary text-primary" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
