import {
  createParamDecorator,
  type ExecutionContext,
} from "@nestjs/common";

import type { AuthenticatedRequest, AuthUser } from "./jwt-auth.guard";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
