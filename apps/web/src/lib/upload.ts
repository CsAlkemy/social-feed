import { upload } from "@vercel/blob/client";

import { apiUrl, getAccessToken } from "@repo/library/apis";

export async function uploadImage(file: File): Promise<string> {
  const token = getAccessToken();
  if (!token) throw new Error("You are signed out. Please sign in again.");

  const blob = await upload(`avatars/${crypto.randomUUID()}`, file, {
    access: "public",
    contentType: file.type,
    handleUploadUrl: apiUrl("users", "avatar/upload-url"),
    headers: { Authorization: `Bearer ${token}` },
  });

  return blob.url;
}
