import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  userId: z.string().min(1),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;

export const memberQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(100).optional(),
});

export type MemberQuery = z.infer<typeof memberQuerySchema>;
