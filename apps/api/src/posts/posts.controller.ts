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
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import {
  JwtAuthGuard,
  type AccessTokenPayload,
  type AuthUser,
} from "../auth/jwt-auth.guard";
import {
  POST_SCHEMA,
  REACTOR_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import type { Env } from "../config/env";
import { PostsService } from "./posts.service";

const POST_IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const POST_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

@ApiTags("posts")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @ApiOperation({ summary: "List feed posts (cursor-paginated)" })
  @ApiOkResponse({ schema: pageSchema(POST_SCHEMA) })
  @UseGuards(JwtAuthGuard)
  @Get()
  feed(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<PostEntity>> {
    return this.postsService.feed(user.id, query);
  }

  @ApiOperation({ summary: "Create a post" })
  @ApiBody({ schema: zodToOpenApi(createPostSchema) })
  @ApiCreatedResponse({ schema: POST_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @UseGuards(JwtAuthGuard)
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
          allowedContentTypes: POST_IMAGE_CONTENT_TYPES,
          maximumSizeInBytes: POST_IMAGE_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Not reached in local dev (no public callback URL); the resulting
        // URL is persisted when the post is created.
      },
    });
  }

  @ApiOperation({ summary: "Get a single post" })
  @ApiOkResponse({ schema: POST_SCHEMA })
  @ApiNotFoundResponse({ description: "Post not found" })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.postsService.remove(user.id, id);
  }

  @ApiOperation({ summary: "Add or change your reaction to a post" })
  @ApiBody({ schema: zodToOpenApi(reactionSchema) })
  @ApiOkResponse({ schema: POST_SCHEMA })
  @ApiNotFoundResponse({ description: "Post not found" })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Delete(":id/reaction")
  unreact(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<PostEntity> {
    return this.postsService.unreact(user.id, id);
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
