import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
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
  createPostSchema,
  cursorQuerySchema,
  reactionSchema,
  reactorQuerySchema,
  updatePostSchema,
  type CreatePostInput,
  type CursorQuery,
  type Page,
  type Post as PostEntity,
  type ReactionInput,
  type Reactor,
  type ReactorQuery,
  type UpdatePostInput,
} from "@repo/library";
import type { HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard, type AuthUser } from "../auth/jwt-auth.guard";
import { BlobUploadService } from "../common/blob-upload.service";
import {
  POST_SCHEMA,
  REACTOR_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { PostsService } from "./posts.service";

const POST_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

@ApiTags("posts")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@UseGuards(JwtAuthGuard)
@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly blobUpload: BlobUploadService,
  ) {}

  @ApiOperation({ summary: "List feed posts (cursor-paginated)" })
  @ApiOkResponse({ schema: pageSchema(POST_SCHEMA) })
  @Get()
  feed(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<PostEntity>> {
    return this.postsService.feed(user.id, query);
  }

  @ApiOperation({ summary: "List posts you saved (cursor-paginated)" })
  @ApiOkResponse({ schema: pageSchema(POST_SCHEMA) })
  @Get("saved")
  saved(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<PostEntity>> {
    return this.postsService.saved(user.id, query);
  }

  @ApiOperation({ summary: "Create a post" })
  @ApiBody({ schema: zodToOpenApi(createPostSchema) })
  @ApiCreatedResponse({ schema: POST_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createPostSchema)) body: CreatePostInput,
  ): Promise<PostEntity> {
    return this.postsService.create(user.id, body);
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @Post("media/upload-url")
  createMediaUploadUrl(@Body() body: HandleUploadBody, @Req() req: Request) {
    return this.blobUpload.handle(req, body, POST_IMAGE_MAX_BYTES);
  }

  @ApiOperation({ summary: "Get a single post" })
  @ApiOkResponse({ schema: POST_SCHEMA })
  @ApiNotFoundResponse({ description: "Post not found" })
  @Get(":id")
  findOne(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<PostEntity> {
    return this.postsService.findOne(user.id, id);
  }

  @ApiOperation({ summary: "List users who reacted to a post" })
  @ApiOkResponse({ schema: pageSchema(REACTOR_SCHEMA) })
  @ApiNotFoundResponse({ description: "Post not found" })
  @Get(":id/reactions")
  reactors(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Query(new ZodValidationPipe(reactorQuerySchema)) query: ReactorQuery,
  ): Promise<Page<Reactor>> {
    return this.postsService.reactors(user.id, id, query);
  }

  @ApiOperation({ summary: "Update your post" })
  @ApiBody({ schema: zodToOpenApi(updatePostSchema) })
  @ApiOkResponse({ schema: POST_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @ApiForbiddenResponse({ description: "Not the author" })
  @ApiNotFoundResponse({ description: "Post not found" })
  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updatePostSchema)) body: UpdatePostInput,
  ): Promise<PostEntity> {
    return this.postsService.update(user.id, id, body);
  }

  @ApiOperation({ summary: "Delete your post" })
  @ApiNoContentResponse({ description: "Post deleted" })
  @ApiForbiddenResponse({ description: "Not the author" })
  @ApiNotFoundResponse({ description: "Post not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.postsService.remove(user.id, id);
  }

  @ApiOperation({ summary: "Save a post for later" })
  @ApiOkResponse({ schema: POST_SCHEMA })
  @ApiNotFoundResponse({ description: "Post not found" })
  @Put(":id/save")
  save(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<PostEntity> {
    return this.postsService.save(user.id, id);
  }

  @ApiOperation({ summary: "Remove a post from your saved list" })
  @ApiOkResponse({ schema: POST_SCHEMA })
  @Delete(":id/save")
  unsave(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<PostEntity> {
    return this.postsService.unsave(user.id, id);
  }

  @ApiOperation({ summary: "Add or change your reaction to a post" })
  @ApiBody({ schema: zodToOpenApi(reactionSchema) })
  @ApiOkResponse({ schema: POST_SCHEMA })
  @ApiNotFoundResponse({ description: "Post not found" })
  @Put(":id/reaction")
  react(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reactionSchema)) body: ReactionInput,
  ): Promise<PostEntity> {
    return this.postsService.react(user.id, id, body.type);
  }

  @ApiOperation({ summary: "Remove your reaction from a post" })
  @ApiOkResponse({ schema: POST_SCHEMA })
  @Delete(":id/reaction")
  unreact(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<PostEntity> {
    return this.postsService.unreact(user.id, id);
  }
}
