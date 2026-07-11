import type { ApiBodyOptions } from "@nestjs/swagger";
import { z, type ZodType } from "zod";

export type ApiSchemaObject = Exclude<
  Extract<ApiBodyOptions, { schema: unknown }>["schema"],
  { $ref: string }
>;

export function zodToOpenApi(schema: ZodType): ApiSchemaObject {
  return z.toJSONSchema(schema, {
    target: "openapi-3.0",
    io: "input",
  }) as ApiSchemaObject;
}
