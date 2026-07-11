import { CameraIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { toast } from "../schadcn/sonner";
import { CommonButton } from "./common-button";
import { Spinner } from "./spinner";
import { UserAvatar } from "./user-avatar";

export interface CommonImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  uploader: (file: File) => Promise<string>;
  fallback?: string;
  label?: string;
  hint?: string;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
}

export function CommonImageUpload({
  value,
  onChange,
  uploader,
  fallback = "",
  label = "Upload photo",
  hint,
  accept = "image/*",
  maxSizeMb = 5,
  disabled,
  className,
}: CommonImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const busy = disabled || uploading;

  const pick = () => inputRef.current?.click();

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMb}MB`);
      return;
    }

    setUploading(true);
    try {
      onChange(await uploader(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div className="relative shrink-0">
        <UserAvatar name={fallback} src={value} className="size-20" />
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          aria-label={label}
          className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {uploading ? (
            <Spinner className="size-4 text-current" />
          ) : (
            <CameraIcon className="size-4" />
          )}
        </button>
      </div>

      <div className="grid gap-1.5">
        <div className="flex flex-wrap gap-2">
          <CommonButton
            type="button"
            variant="outline"
            size="sm"
            loading={uploading}
            disabled={disabled}
            onClick={pick}
          >
            {label}
          </CommonButton>
          {value ? (
            <CommonButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onChange(null)}
            >
              Remove
            </CommonButton>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {hint ?? `JPG, PNG or WebP, up to ${maxSizeMb}MB.`}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={busy}
        onChange={handleChange}
      />
    </div>
  );
}
