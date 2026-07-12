import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  createStorySchema,
  cursorQuerySchema,
  type CreateStoryInput,
  type CursorQuery,
  type Page,
  type Story as StoryEntity,
  type StoryGroup,
  type StoryViewer,
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
  STORY_GROUP_SCHEMA,
  STORY_SCHEMA,
  STORY_VIEWER_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import type { Env } from "../config/env";
import { StoriesService } from "./stories.service";

const STORY_IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const STORY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

@ApiTags("stories")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@Controller("stories")
export class StoriesController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @ApiOperation({ summary: "List active stories grouped by author" })
  @ApiOkResponse({ schema: { type: "array", items: STORY_GROUP_SCHEMA } })
  @UseGuards(JwtAuthGuard)
  @Get()
  feed(@CurrentUser() user: AuthUser): Promise<StoryGroup[]> {
    return this.storiesService.feed(user.id);
  }

  @ApiOperation({ summary: "Create a story" })
  @ApiBody({ schema: zodToOpenApi(createStorySchema) })
  @ApiCreatedResponse({ schema: STORY_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createStorySchema)) body: CreateStoryInput,
  ): Promise<StoryEntity> {
    return this.storiesService.create(user.id, body);
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @Post("media/upload-url")
  async createMediaUploadUrl(@Body() body: HandleUploadBody, @Req() req: Request) {
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
          allowedContentTypes: STORY_IMAGE_CONTENT_TYPES,
          maximumSizeInBytes: STORY_IMAGE_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Not reached in local dev (no public callback URL); the resulting
        // URL is persisted when the story is created.
      },
    });
  }

  @ApiOperation({ summary: "Mark a story as viewed" })
  @ApiOkResponse({ schema: STORY_SCHEMA })
  @ApiNotFoundResponse({ description: "Story not found" })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post(":id/view")
  view(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<StoryEntity> {
    return this.storiesService.view(user.id, id);
  }

  @ApiOperation({ summary: "List viewers of your story" })
  @ApiOkResponse({ schema: pageSchema(STORY_VIEWER_SCHEMA) })
  @ApiForbiddenResponse({ description: "Not the author" })
  @ApiNotFoundResponse({ description: "Story not found" })
  @UseGuards(JwtAuthGuard)
  @Get(":id/viewers")
  viewers(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<StoryViewer>> {
    return this.storiesService.viewers(user.id, id, query);
  }

  @ApiOperation({ summary: "Delete your story" })
  @ApiNoContentResponse({ description: "Story deleted" })
  @ApiForbiddenResponse({ description: "Not the author" })
  @ApiNotFoundResponse({ description: "Story not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.storiesService.remove(user.id, id);
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
