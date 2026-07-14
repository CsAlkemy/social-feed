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
  UseGuards,
} from "@nestjs/common";
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
import type { HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard, type AuthUser } from "../auth/jwt-auth.guard";
import { BlobUploadService } from "../common/blob-upload.service";
import {
  STORY_GROUP_SCHEMA,
  STORY_SCHEMA,
  STORY_VIEWER_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { StoriesService } from "./stories.service";

const STORY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

@ApiTags("stories")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@UseGuards(JwtAuthGuard)
@Controller("stories")
export class StoriesController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly blobUpload: BlobUploadService,
  ) {}

  @ApiOperation({ summary: "List active stories grouped by author" })
  @ApiOkResponse({ schema: { type: "array", items: STORY_GROUP_SCHEMA } })
  @Get()
  feed(@CurrentUser() user: AuthUser): Promise<StoryGroup[]> {
    return this.storiesService.feed(user.id);
  }

  @ApiOperation({ summary: "Create a story" })
  @ApiBody({ schema: zodToOpenApi(createStorySchema) })
  @ApiCreatedResponse({ schema: STORY_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
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
  createMediaUploadUrl(@Body() body: HandleUploadBody, @Req() req: Request) {
    return this.blobUpload.handle(req, body, STORY_IMAGE_MAX_BYTES);
  }

  @ApiOperation({ summary: "Mark a story as viewed" })
  @ApiOkResponse({ schema: STORY_SCHEMA })
  @ApiNotFoundResponse({ description: "Story not found" })
  @HttpCode(HttpStatus.OK)
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
  @Delete(":id")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.storiesService.remove(user.id, id);
  }
}
