import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.email("Enter a valid email address"),
  avatarUrl: z.string().max(2048).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
