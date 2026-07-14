import { z } from "zod";

import { httpUrlSchema } from "./url-schema";

export const createStorySchema = z.object({
  imageUrl: httpUrlSchema,
  caption: z.string().trim().max(200).optional(),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;
