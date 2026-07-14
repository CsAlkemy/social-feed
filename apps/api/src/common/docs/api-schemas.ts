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

export const MEMBER_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    ...USER_SCHEMA.properties,
    friendStatus: {
      type: "string",
      enum: ["NONE", "FRIENDS", "REQUEST_SENT", "REQUEST_RECEIVED"],
      example: "NONE",
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

const REACTION_TYPES = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];

export const REACTION_COUNTS_SCHEMA: ApiSchemaObject = {
  type: "object",
  additionalProperties: { type: "integer" },
  example: { LIKE: 2, LOVE: 1 },
};

export const VIEWER_REACTION_SCHEMA: ApiSchemaObject = {
  type: "string",
  enum: REACTION_TYPES,
  nullable: true,
  example: "LIKE",
};

export const REACTOR_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    user: USER_SCHEMA,
    type: { type: "string", enum: REACTION_TYPES, example: "LIKE" },
  },
};

export const POST_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "cmrgnooue0000of3240g0lxg3" },
    content: { type: "string", example: "Just shipped a new feature!" },
    imageUrls: { type: "array", items: { type: "string" } },
    visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
    author: USER_SCHEMA,
    likeCount: { type: "integer", example: 3 },
    reactionCounts: REACTION_COUNTS_SCHEMA,
    viewerReaction: VIEWER_REACTION_SCHEMA,
    viewerSaved: { type: "boolean", example: false },
    commentCount: { type: "integer", example: 0 },
    shareCount: { type: "integer", example: 0 },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2026-07-11T17:46:15.110Z",
    },
  },
};

export const COMMENT_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "cmrgnooue0000of3240g0lxg3" },
    postId: { type: "string", example: "cmrgnooue0000of3240g0lxg3" },
    parentId: { type: "string", nullable: true, example: null },
    content: { type: "string", example: "Congrats, this looks great!" },
    author: USER_SCHEMA,
    likeCount: { type: "integer", example: 3 },
    reactionCounts: REACTION_COUNTS_SCHEMA,
    viewerReaction: VIEWER_REACTION_SCHEMA,
    replyCount: { type: "integer", example: 0 },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2026-07-11T17:46:15.110Z",
    },
  },
};

export const STORY_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "cmrgnooue0000of3240g0lxg3" },
    author: USER_SCHEMA,
    imageUrl: { type: "string" },
    caption: { type: "string", nullable: true, example: "On the road" },
    viewed: { type: "boolean", example: false },
    viewerCount: { type: "integer", example: 4 },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2026-07-11T17:46:15.110Z",
    },
    expiresAt: {
      type: "string",
      format: "date-time",
      example: "2026-07-12T17:46:15.110Z",
    },
  },
};

export const STORY_GROUP_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    author: USER_SCHEMA,
    stories: { type: "array", items: STORY_SCHEMA },
    hasUnseen: { type: "boolean", example: true },
  },
};

export const STORY_VIEWER_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    user: USER_SCHEMA,
    viewedAt: {
      type: "string",
      format: "date-time",
      example: "2026-07-11T17:46:15.110Z",
    },
  },
};

export const EVENT_SCHEMA: ApiSchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "cmrgnooue0000of3240g0lxg3" },
    title: { type: "string", example: "International Conference on Design" },
    description: { type: "string", nullable: true, example: null },
    location: { type: "string", nullable: true, example: "Dhaka" },
    coverUrl: { type: "string", nullable: true, example: null },
    startsAt: {
      type: "string",
      format: "date-time",
      example: "2026-07-18T10:00:00.000Z",
    },
    creator: USER_SCHEMA,
    goingCount: { type: "integer", example: 17 },
    viewerGoing: { type: "boolean", example: false },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2026-07-11T17:46:15.110Z",
    },
  },
};

export function pageSchema(item: ApiSchemaObject): ApiSchemaObject {
  return {
    type: "object",
    properties: {
      items: { type: "array", items: item },
      nextCursor: { type: "string", nullable: true, example: null },
    },
  };
}
