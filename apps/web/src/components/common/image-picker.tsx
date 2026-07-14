import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { ImageIcon, XIcon } from "lucide-react";

import { UPLOAD_IMAGE_ACCEPT } from "@repo/library";
import { cn } from "@repo/ui";

export function ImagePicker({
  file,
  onChange,
  label,
  alt = "Preview",
  className,
  previewClassName,
  imageClassName,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
  alt?: string;
  className?: string;
  previewClassName?: string;
  imageClassName?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) onChange(selected);
    event.target.value = "";
  };

  return (
    <>
      {preview ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg",
            className,
            previewClassName,
          )}
        >
          <Image
            src={preview}
            alt={alt}
            fill
            unoptimized
            className={imageClassName}
          />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
            className,
          )}
        >
          <ImageIcon className="size-8" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_IMAGE_ACCEPT}
        onChange={handleSelect}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
    </>
  );
}
