import { upload } from "@vercel/blob/client";

import { apiUrl, getAccessToken } from "@repo/library/apis";

interface UploadOptions {
  pathPrefix?: string;
  handleUploadUrl?: string;
}

export async function uploadImage(
  file: File,
  options: UploadOptions = {},
): Promise<string> {
  const token = getAccessToken();
  if (!token) throw new Error("You are signed out. Please sign in again.");

  const pathPrefix = options.pathPrefix ?? "avatars";
  const handleUploadUrl =
    options.handleUploadUrl ?? apiUrl("users", "avatar/upload-url");

  const blob = await upload(`${pathPrefix}/${crypto.randomUUID()}`, file, {
    access: "public",
    contentType: file.type,
    handleUploadUrl,
    headers: { Authorization: `Bearer ${token}` },
  });

  return blob.url;
}

export function uploadPostImage(file: File): Promise<string> {
  return uploadImage(file, {
    pathPrefix: "post-media",
    handleUploadUrl: apiUrl("posts", "media/upload-url"),
  });
}

export function uploadStoryImage(file: File): Promise<string> {
  return uploadImage(file, {
    pathPrefix: "story-media",
    handleUploadUrl: apiUrl("stories", "media/upload-url"),
  });
}
