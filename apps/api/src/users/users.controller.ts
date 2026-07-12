import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  cursorQuerySchema,
  memberQuerySchema,
  updateProfileSchema,
  type CursorQuery,
  type Member,
  type MemberQuery,
  type Page,
  type UpdateProfileInput,
  type User as UserEntity,
} from "@repo/library";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import {
  JwtAuthGuard,
  type AccessTokenPayload,
  type AuthUser,
} from "../auth/jwt-auth.guard";
import {
  MEMBER_SCHEMA,
  USER_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import type { Env } from "../config/env";
import { UsersService } from "./users.service";

const AVATAR_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @ApiOperation({ summary: "List platform members (cursor-paginated)" })
  @ApiBearerAuth("access-token")
  @ApiUnauthorizedResponse({ description: "Missing or expired access token" })
  @ApiOkResponse({ schema: pageSchema(MEMBER_SCHEMA) })
  @UseGuards(JwtAuthGuard)
  @Get()
  members(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(memberQuerySchema)) query: MemberQuery,
  ): Promise<Page<Member>> {
    return this.usersService.listMembers(user.id, query);
  }

  @ApiOperation({ summary: "People you may know" })
  @ApiBearerAuth("access-token")
  @ApiUnauthorizedResponse({ description: "Missing or expired access token" })
  @ApiOkResponse({ schema: pageSchema(MEMBER_SCHEMA) })
  @UseGuards(JwtAuthGuard)
  @Get("suggestions")
  suggestions(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<Member>> {
    return this.usersService.listSuggestions(user.id, query);
  }

  @ApiOperation({ summary: "Update the signed-in user's profile" })
  @ApiBearerAuth("access-token")
  @ApiBody({ schema: zodToOpenApi(updateProfileSchema) })
  @ApiOkResponse({
    schema: { type: "object", properties: { user: USER_SCHEMA } },
  })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @ApiUnauthorizedResponse({ description: "Missing or expired access token" })
  @ApiConflictResponse({ description: "Email already registered" })
  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateMe(
    @CurrentUser() authUser: AuthUser,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileInput,
  ): Promise<{ user: UserEntity }> {
    return { user: await this.usersService.updateProfile(authUser.id, body) };
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @Post("avatar/upload-url")
  async createAvatarUploadUrl(
    @Body() body: HandleUploadBody,
    @Req() req: Request,
  ) {
    const token = this.config.get("BLOB_READ_WRITE_TOKEN", { infer: true });

    if (!token) {
      throw new ServiceUnavailableException("Blob storage is not configured");
    }

    return handleUpload({
      token,
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        await this.requireUserId(req);
        return {
          allowedContentTypes: AVATAR_CONTENT_TYPES,
          maximumSizeInBytes: AVATAR_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Not reached in local dev (no public callback URL); the resulting
        // URL is persisted by the client via PATCH /users/me.
      },
    });
  }

  private async requireUserId(req: Request): Promise<string> {
    const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Missing access token");
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }
  }
}
