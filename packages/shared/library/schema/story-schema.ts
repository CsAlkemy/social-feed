import { z } from "zod";

export const createStorySchema = z.object({
  imageUrl: z.string().min(1).max(2048),
  caption: z.string().trim().max(200).optional(),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;
