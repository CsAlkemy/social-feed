import Image from "next/image";

const MAX_VISIBLE_IMAGES = 4;

export function PostImageGrid({ images }: { images: string[] }) {
  const [firstImage] = images;

  if (!firstImage) return null;

  if (images.length === 1) {
    return (
      <Image
        src={firstImage}
        alt="Post image"
        width={680}
        height={400}
        unoptimized={firstImage.startsWith("blob:")}
        className="mt-4 h-auto w-full rounded-md object-cover"
      />
    );
  }

  const visibleImages = images.slice(0, MAX_VISIBLE_IMAGES);
  const hiddenCount = images.length - visibleImages.length;

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {visibleImages.map((src, index) => (
        <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-md">
          <Image
            src={src}
            alt={`Post image ${index + 1}`}
            fill
            sizes="(max-width: 1024px) 50vw, 320px"
            unoptimized={src.startsWith("blob:")}
            className="object-cover"
          />
          {hiddenCount > 0 && index === visibleImages.length - 1 ? (
            <span className="absolute inset-0 grid place-items-center bg-black/60 text-lg font-semibold text-white">
              +{hiddenCount}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
