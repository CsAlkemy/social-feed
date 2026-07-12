import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Write something").max(2000),
  parentId: z.string().nullable().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, "Write something").max(2000),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
