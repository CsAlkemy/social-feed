import Image from "next/image";
import { useState } from "react";

import { cn } from "@repo/ui";

import { ImageLightbox } from "@/components/feed/posts/image-lightbox";

const MAX_VISIBLE = 5;

function Tile({
  src,
  index,
  onOpen,
  overlay,
  className,
  priority,
}: {
  src: string;
  index: number;
  onOpen: (index: number) => void;
  overlay?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Post image ${index + 1}`}
      className={cn("group relative overflow-hidden bg-secondary", className)}
    >
      <Image
        src={src}
        alt={`Post image ${index + 1}`}
        fill
        sizes="(max-width: 1024px) 100vw, 640px"
        priority={priority}
        unoptimized={src.startsWith("blob:")}
        className="object-cover transition-transform duration-200 group-hover:scale-105"
      />
      {overlay ? (
        <span className="absolute inset-0 grid place-items-center bg-black/60 text-2xl font-semibold text-white">
          +{overlay}
        </span>
      ) : null}
    </button>
  );
}

export function PostImageGrid({
  images,
  priority = false,
}: {
  images: string[];
  priority?: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const open = (index: number) => setLightboxIndex(index);
  const lightbox = (
    <ImageLightbox
      images={images}
      index={lightboxIndex}
      onClose={() => setLightboxIndex(null)}
      onIndexChange={setLightboxIndex}
    />
  );

  if (images.length === 1) {
    return (
      <>
        <button
          type="button"
          onClick={() => open(0)}
          aria-label="Post image"
          className="mt-4 block w-full overflow-hidden rounded-md"
        >
          <Image
            src={images[0]!}
            alt="Post image"
            width={680}
            height={400}
            priority={priority}
            unoptimized={images[0]!.startsWith("blob:")}
            className="max-h-[32rem] w-full object-cover"
          />
        </button>
        {lightbox}
      </>
    );
  }

  const visible = images.slice(0, MAX_VISIBLE);
  const hidden = images.length - visible.length;
  const gridClassName = "mt-4 grid gap-1 overflow-hidden rounded-md";

  let grid: React.ReactNode;
  if (images.length === 2) {
    grid = (
      <div className={cn(gridClassName, "aspect-[16/9] grid-cols-2")}>
        <Tile src={visible[0]!} index={0} onOpen={open} priority={priority} />
        <Tile src={visible[1]!} index={1} onOpen={open} />
      </div>
    );
  } else if (images.length === 3) {
    grid = (
      <div className={cn(gridClassName, "aspect-[16/10] grid-cols-2 grid-rows-2")}>
        <Tile src={visible[0]!} index={0} onOpen={open} className="row-span-2" priority={priority} />
        <Tile src={visible[1]!} index={1} onOpen={open} />
        <Tile src={visible[2]!} index={2} onOpen={open} />
      </div>
    );
  } else if (images.length === 4) {
    grid = (
      <div className={cn(gridClassName, "aspect-[4/3] grid-cols-2 grid-rows-2")}>
        {visible.map((src, index) => (
          <Tile
            key={`${src}-${index}`}
            src={src}
            index={index}
            onOpen={open}
            priority={priority && index === 0}
          />
        ))}
      </div>
    );
  } else {
    grid = (
      <div className={cn(gridClassName, "aspect-[16/10] grid-cols-6 grid-rows-2")}>
        <Tile src={visible[0]!} index={0} onOpen={open} className="col-span-3" priority={priority} />
        <Tile src={visible[1]!} index={1} onOpen={open} className="col-span-3" />
        <Tile src={visible[2]!} index={2} onOpen={open} className="col-span-2" />
        <Tile src={visible[3]!} index={3} onOpen={open} className="col-span-2" />
        <Tile
          src={visible[4]!}
          index={4}
          onOpen={open}
          overlay={hidden > 0 ? hidden : undefined}
          className="col-span-2"
        />
      </div>
    );
  }

  return (
    <>
      {grid}
      {lightbox}
    </>
  );
}
