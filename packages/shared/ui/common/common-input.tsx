import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../lib/cn";
import { composeRefs } from "../lib/compose-refs";
import { Input } from "../schadcn/input";
import { Label } from "../schadcn/label";

export interface CommonInputProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<"input">, "name" | "defaultValue"> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  containerClassName?: string;
}

export function CommonInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  type,
  id,
  containerClassName,
  className,
  onChange,
  onBlur,
  ref,
  ...props
}: CommonInputProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name });
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const isPassword = type === "password";
  const errorMessage = fieldState.error?.message;

  return (
    <div className={cn("grid gap-2", containerClassName)}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <div className="relative">
        <Input
          {...props}
          id={inputId}
          name={field.name}
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={fieldState.invalid || undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          className={cn(isPassword && "pr-12", className)}
          value={field.value ?? ""}
          onChange={(event) => {
            field.onChange(event);
            onChange?.(event);
          }}
          onBlur={(event) => {
            field.onBlur();
            onBlur?.(event);
          }}
          ref={composeRefs(field.ref, ref)}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        ) : null}
      </div>
      {errorMessage ? (
        <p id={errorId} className="text-[13px] text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
