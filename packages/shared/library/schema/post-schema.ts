import { z } from "zod";

import { PostVisibility } from "../enum/post-visibility";
import { httpUrlSchema } from "./url-schema";

export const createPostSchema = z
  .object({
    content: z.string().trim().max(5000).default(""),
    imageUrls: z.array(httpUrlSchema).max(10).default([]),
    visibility: z.enum(PostVisibility).default(PostVisibility.PUBLIC),
  })
  .refine((data) => data.content.length > 0 || data.imageUrls.length > 0, {
    message: "Write something or add a photo",
    path: ["content"],
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
  .object({
    content: z.string().trim().max(5000).default(""),
    imageUrls: z.array(httpUrlSchema).max(10).default([]),
    visibility: z.enum(PostVisibility),
  })
  .refine((data) => data.content.length > 0 || data.imageUrls.length > 0, {
    message: "Write something or add a photo",
    path: ["content"],
  });

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
