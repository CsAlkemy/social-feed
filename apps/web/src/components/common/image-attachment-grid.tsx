import Image from "next/image";

import { XIcon } from "lucide-react";

import { cn } from "@repo/ui";

export function ImageAttachmentGrid({
  images,
  onRemove,
  className,
}: {
  images: { key: string; src: string }[];
  onRemove: (key: string) => void;
  className?: string;
}) {
  if (images.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4", className)}>
      {images.map((image) => (
        <div
          key={image.key}
          className="relative aspect-square overflow-hidden rounded-md"
        >
          <Image
            src={image.src}
            alt="Attached photo"
            fill
            unoptimized
            className="object-cover"
          />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => onRemove(image.key)}
            className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
