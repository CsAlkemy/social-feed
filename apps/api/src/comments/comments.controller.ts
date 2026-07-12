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
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  createCommentSchema,
  cursorQuerySchema,
  reactionSchema,
  updateCommentSchema,
  type Comment as CommentEntity,
  type CreateCommentInput,
  type CursorQuery,
  type Page,
  type ReactionInput,
  type UpdateCommentInput,
} from "@repo/library";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard, type AuthUser } from "../auth/jwt-auth.guard";
import {
  COMMENT_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { CommentsService } from "./comments.service";

@ApiTags("comments")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: "List a post's top-level comments" })
  @ApiOkResponse({ schema: pageSchema(COMMENT_SCHEMA) })
  @ApiNotFoundResponse({ description: "Post not found" })
  @Get("posts/:postId/comments")
  listForPost(
    @CurrentUser() user: AuthUser,
    @Param("postId") postId: string,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<CommentEntity>> {
    return this.commentsService.listForPost(user.id, postId, query);
  }

  @ApiOperation({ summary: "Add a comment or reply to a post" })
  @ApiBody({ schema: zodToOpenApi(createCommentSchema) })
  @ApiCreatedResponse({ schema: COMMENT_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @ApiNotFoundResponse({ description: "Post or parent comment not found" })
  @Post("posts/:postId/comments")
  create(
    @CurrentUser() user: AuthUser,
    @Param("postId") postId: string,
    @Body(new ZodValidationPipe(createCommentSchema)) body: CreateCommentInput,
  ): Promise<CommentEntity> {
    return this.commentsService.create(user.id, postId, body);
  }

  @ApiOperation({ summary: "List replies to a comment" })
  @ApiOkResponse({ schema: pageSchema(COMMENT_SCHEMA) })
  @ApiNotFoundResponse({ description: "Comment not found" })
  @Get("comments/:id/replies")
  listReplies(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<CommentEntity>> {
    return this.commentsService.listReplies(user.id, id, query);
  }

  @ApiOperation({ summary: "Edit your comment" })
  @ApiBody({ schema: zodToOpenApi(updateCommentSchema) })
  @ApiOkResponse({ schema: COMMENT_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @ApiForbiddenResponse({ description: "Not the author" })
  @ApiNotFoundResponse({ description: "Comment not found" })
  @Patch("comments/:id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCommentSchema)) body: UpdateCommentInput,
  ): Promise<CommentEntity> {
    return this.commentsService.update(user.id, id, body);
  }

  @ApiOperation({ summary: "Delete your comment" })
  @ApiNoContentResponse({ description: "Comment deleted" })
  @ApiForbiddenResponse({ description: "Not the author" })
  @ApiNotFoundResponse({ description: "Comment not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("comments/:id")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<void> {
    return this.commentsService.remove(user.id, id);
  }

  @ApiOperation({ summary: "Add or change your reaction to a comment" })
  @ApiBody({ schema: zodToOpenApi(reactionSchema) })
  @ApiOkResponse({ schema: COMMENT_SCHEMA })
  @ApiNotFoundResponse({ description: "Comment not found" })
  @Put("comments/:id/reaction")
  react(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reactionSchema)) body: ReactionInput,
  ): Promise<CommentEntity> {
    return this.commentsService.react(user.id, id, body.type);
  }

  @ApiOperation({ summary: "Remove your reaction from a comment" })
  @ApiOkResponse({ schema: COMMENT_SCHEMA })
  @Delete("comments/:id/reaction")
  unreact(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<CommentEntity> {
    return this.commentsService.unreact(user.id, id);
  }
}
