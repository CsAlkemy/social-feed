import type { ApiSchemaObject } from "./zod-to-openapi";

export const USER_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "cmrgnooue0000of3240g0lxg3" },
    firstName: { type: "string", example: "Jane" },
    lastName: { type: "string", example: "Doe" },
    email: { type: "string", example: "jane@example.com" },
    avatarUrl: { type: "string", nullable: true, example: null },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2026-07-11T17:46:15.110Z",
    },
  },
};

export const AUTH_RESPONSE_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    user: USER_SCHEMA,
    accessToken: {
      type: "string",
      description:
        "Short-lived JWT. Send as `Authorization: Bearer <token>` on protected routes. A rotating refresh token is also set as an httpOnly cookie.",
    },
  },
};

export const VALIDATION_ERROR_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    message: { type: "string", example: "Validation failed" },
    errors: {
      type: "object",
      additionalProperties: { type: "array", items: { type: "string" } },
      example: { email: ["Enter a valid email address"] },
    },
  },
};
