import Image from "next/image";
import { useEffect } from "react";

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

const controlClassName =
  "absolute z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20";

export function ImageLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const open = index !== null;

  useEffect(() => {
    if (!open || index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") onIndexChange((index + 1) % images.length);
      else if (event.key === "ArrowLeft")
        onIndexChange((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, images.length, onClose, onIndexChange]);

  if (!open || index === null) return null;

  const many = images.length > 1;
  const go = (delta: number) =>
    onIndexChange((index + delta + images.length) % images.length);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`${controlClassName} right-4 top-4`}
      >
        <XIcon className="size-5" />
      </button>

      {many ? (
        <button
          type="button"
          aria-label="Previous image"
          onClick={(event) => {
            event.stopPropagation();
            go(-1);
          }}
          className={`${controlClassName} left-4 top-1/2 -translate-y-1/2`}
        >
          <ChevronLeftIcon className="size-6" />
        </button>
      ) : null}

      <div
        className="relative h-[85vh] w-[90vw]"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={images[index]!}
          alt={`Image ${index + 1}`}
          fill
          unoptimized
          sizes="90vw"
          className="object-contain"
        />
      </div>

      {many ? (
        <button
          type="button"
          aria-label="Next image"
          onClick={(event) => {
            event.stopPropagation();
            go(1);
          }}
          className={`${controlClassName} right-4 top-1/2 -translate-y-1/2`}
        >
          <ChevronRightIcon className="size-6" />
        </button>
      ) : null}

      {many ? (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
          {index + 1} / {images.length}
        </span>
      ) : null}
    </div>
  );
}
