export const UPLOAD_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const UPLOAD_IMAGE_ACCEPT = UPLOAD_IMAGE_TYPES.join(",");

export const UPLOAD_IMAGE_LABEL = "JPG, PNG, WebP, AVIF or GIF";

export function isUploadImageType(type: string): boolean {
  return (UPLOAD_IMAGE_TYPES as readonly string[]).includes(type);
}
