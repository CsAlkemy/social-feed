import * as React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../lib/cn";
import { Label } from "../schadcn/label";
import { RadioGroup, RadioGroupItem } from "../schadcn/radio-group";

export interface CommonRadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CommonRadioGroupProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  options: CommonRadioOption[];
  label?: string;
  orientation?: "vertical" | "horizontal";
  id?: string;
  containerClassName?: string;
}

export function CommonRadioGroup<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  label,
  orientation = "vertical",
  id,
  containerClassName,
}: CommonRadioGroupProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name });
  const generatedId = React.useId();
  const groupId = id ?? generatedId;
  const labelId = `${groupId}-label`;
  const errorId = `${groupId}-error`;
  const errorMessage = fieldState.error?.message;

  return (
    <div className={cn("grid gap-2", containerClassName)}>
      {label ? <Label id={labelId}>{label}</Label> : null}
      <RadioGroup
        value={field.value ?? ""}
        onValueChange={field.onChange}
        onBlur={field.onBlur}
        aria-labelledby={label ? labelId : undefined}
        aria-invalid={fieldState.invalid || undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        className={cn(orientation === "horizontal" && "flex flex-wrap items-center gap-5")}
      >
        {options.map((option, index) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem
              id={`${groupId}-${option.value}`}
              value={option.value}
              disabled={option.disabled}
              ref={index === 0 ? field.ref : undefined}
            />
            <Label htmlFor={`${groupId}-${option.value}`} className="cursor-pointer font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {errorMessage ? (
        <p id={errorId} className="text-[13px] text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
