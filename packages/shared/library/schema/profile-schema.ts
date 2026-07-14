import { z } from "zod";

import { httpUrlSchema } from "./url-schema";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.email("Enter a valid email address"),
  avatarUrl: httpUrlSchema.nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
