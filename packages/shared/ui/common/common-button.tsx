import * as React from "react";

import { cn } from "../lib/cn";
import { Button, type ButtonProps } from "../schadcn/button";
import { Spinner } from "./spinner";

export interface CommonButtonProps extends ButtonProps {
  loading?: boolean;
}

export function CommonButton({
  loading = false,
  disabled,
  children,
  asChild = false,
  className,
  ...props
}: CommonButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  if (asChild) {
    return (
      <Button
        asChild
        aria-disabled={isDisabled || undefined}
        className={cn(isDisabled && "pointer-events-none opacity-50", className)}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button className={className} disabled={isDisabled} {...props}>
      {loading ? <Spinner className="size-4 text-current" /> : null}
      {children}
    </Button>
  );
}
