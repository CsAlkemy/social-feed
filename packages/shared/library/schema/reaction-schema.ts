import { z } from "zod";

import { ReactionType } from "../enum/reaction-type";

export const reactionSchema = z.object({
  type: z.enum(ReactionType),
});

export type ReactionInput = z.infer<typeof reactionSchema>;

export const reactorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(ReactionType).optional(),
});

export type ReactorQuery = z.infer<typeof reactorQuerySchema>;
