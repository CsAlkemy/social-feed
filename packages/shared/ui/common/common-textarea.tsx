import * as React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../lib/cn";
import { composeRefs } from "../lib/compose-refs";
import { Label } from "../schadcn/label";
import { Textarea } from "../schadcn/textarea";

export interface CommonTextareaProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<"textarea">, "name" | "defaultValue"> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  containerClassName?: string;
}

export function CommonTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  id,
  containerClassName,
  className,
  onChange,
  onBlur,
  ref,
  ...props
}: CommonTextareaProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name });
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const errorMessage = fieldState.error?.message;

  return (
    <div className={cn("grid gap-2", containerClassName)}>
      {label ? <Label htmlFor={textareaId}>{label}</Label> : null}
      <Textarea
        {...props}
        id={textareaId}
        name={field.name}
        aria-invalid={fieldState.invalid || undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        className={className}
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
      {errorMessage ? (
        <p id={errorId} className="text-[13px] text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
