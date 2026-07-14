import { z } from "zod";

import { httpUrlSchema } from "./url-schema";

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "Give your event a title").max(120),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(200).optional(),
  coverUrl: httpUrlSchema.nullable().optional(),
  startsAt: z.iso.datetime("Pick a date and time"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
