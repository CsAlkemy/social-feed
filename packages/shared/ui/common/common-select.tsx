import * as React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../lib/cn";
import { Label } from "../schadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../schadcn/select";

export interface CommonSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CommonSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  options: CommonSelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  containerClassName?: string;
  triggerClassName?: string;
}

export function CommonSelect<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  label,
  placeholder = "Select an option",
  disabled,
  id,
  containerClassName,
  triggerClassName,
}: CommonSelectProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name });
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const errorMessage = fieldState.error?.message;
  const validOptions = options.filter((option) => option.value !== "");

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && validOptions.length !== options.length) {
      console.warn(
        "CommonSelect: option values must be non-empty strings; empty-value options were skipped.",
      );
    }
  }, [options.length, validOptions.length]);

  return (
    <div className={cn("grid gap-2", containerClassName)}>
      {label ? <Label htmlFor={selectId}>{label}</Label> : null}
      <Select
        value={field.value ?? ""}
        onValueChange={field.onChange}
        disabled={disabled}
        onOpenChange={(open) => {
          if (!open) {
            field.onBlur();
          }
        }}
      >
        <SelectTrigger
          id={selectId}
          ref={field.ref}
          aria-invalid={fieldState.invalid || undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          className={triggerClassName}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {validOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errorMessage ? (
        <p id={errorId} className="text-[13px] text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
