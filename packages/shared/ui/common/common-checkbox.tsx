import * as React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../lib/cn";
import { composeRefs } from "../lib/compose-refs";
import { Checkbox } from "../schadcn/checkbox";
import { Label } from "../schadcn/label";

export interface CommonCheckboxProps<TFieldValues extends FieldValues>
  extends Omit<
    React.ComponentProps<typeof Checkbox>,
    "name" | "checked" | "defaultChecked"
  > {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: React.ReactNode;
  containerClassName?: string;
}

export function CommonCheckbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  id,
  containerClassName,
  onCheckedChange,
  onBlur,
  ref,
  ...props
}: CommonCheckboxProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name });
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;
  const errorId = `${checkboxId}-error`;
  const errorMessage = fieldState.error?.message;

  return (
    <div className={cn("grid gap-1.5", containerClassName)}>
      <div className="flex items-center gap-2">
        <Checkbox
          {...props}
          id={checkboxId}
          name={field.name}
          checked={field.value === true}
          aria-invalid={fieldState.invalid || undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          onCheckedChange={(checked) => {
            field.onChange(checked === true);
            onCheckedChange?.(checked);
          }}
          onBlur={(event) => {
            field.onBlur();
            onBlur?.(event);
          }}
          ref={composeRefs(field.ref, ref)}
        />
        {label ? (
          <Label htmlFor={checkboxId} className="cursor-pointer font-normal">
            {label}
          </Label>
        ) : null}
      </div>
      {errorMessage ? (
        <p id={errorId} role="alert" className="text-[13px] text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
