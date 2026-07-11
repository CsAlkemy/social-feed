import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const loginFormSchema = loginSchema.extend({
  rememberMe: z.boolean(),
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;

export const registrationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const registrationFormSchema = registrationSchema
  .extend({
    confirmPassword: z.string().min(1, "Please repeat your password"),
    agreedToTerms: z
      .boolean()
      .refine((value) => value, "Please agree to the terms & conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegistrationFormInput = z.infer<typeof registrationFormSchema>;
