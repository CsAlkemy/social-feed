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
  UseGuards,
} from "@nestjs/common";
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
import type { HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard, type AuthUser } from "../auth/jwt-auth.guard";
import { BlobUploadService } from "../common/blob-upload.service";
import {
  MEMBER_SCHEMA,
  USER_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { UsersService } from "./users.service";

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

@ApiTags("users")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly blobUpload: BlobUploadService,
  ) {}

  @ApiOperation({ summary: "List platform members (cursor-paginated)" })
  @ApiOkResponse({ schema: pageSchema(MEMBER_SCHEMA) })
  @Get()
  members(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(memberQuerySchema)) query: MemberQuery,
  ): Promise<Page<Member>> {
    return this.usersService.listMembers(user.id, query);
  }

  @ApiOperation({ summary: "People you may know" })
  @ApiOkResponse({ schema: pageSchema(MEMBER_SCHEMA) })
  @Get("suggestions")
  suggestions(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<Member>> {
    return this.usersService.listSuggestions(user.id, query);
  }

  @ApiOperation({ summary: "Update the signed-in user's profile" })
  @ApiBody({ schema: zodToOpenApi(updateProfileSchema) })
  @ApiOkResponse({
    schema: { type: "object", properties: { user: USER_SCHEMA } },
  })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @ApiConflictResponse({ description: "Email already registered" })
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
  createAvatarUploadUrl(@Body() body: HandleUploadBody, @Req() req: Request) {
    return this.blobUpload.handle(req, body, AVATAR_MAX_BYTES);
  }
}
