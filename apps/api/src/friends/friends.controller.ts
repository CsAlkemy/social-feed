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
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  cursorQuerySchema,
  sendFriendRequestSchema,
  type CursorQuery,
  type Member,
  type Page,
  type SendFriendRequestInput,
} from "@repo/library";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard, type AuthUser } from "../auth/jwt-auth.guard";
import {
  MEMBER_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { FriendsService } from "./friends.service";

@ApiTags("friends")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@UseGuards(JwtAuthGuard)
@Controller("friends")
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOperation({ summary: "List your friends (cursor-paginated)" })
  @ApiOkResponse({ schema: pageSchema(MEMBER_SCHEMA) })
  @Get()
  friends(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<Member>> {
    return this.friendsService.listFriends(user.id, query);
  }

  @ApiOperation({ summary: "List pending friend requests" })
  @ApiQuery({
    name: "direction",
    enum: ["incoming", "outgoing"],
    required: false,
  })
  @ApiOkResponse({ schema: pageSchema(MEMBER_SCHEMA) })
  @Get("requests")
  requests(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
    @Query("direction") direction?: string,
  ): Promise<Page<Member>> {
    return this.friendsService.listRequests(
      user.id,
      query,
      direction === "outgoing" ? "outgoing" : "incoming",
    );
  }

  @ApiOperation({ summary: "Send a friend request" })
  @ApiBody({ schema: zodToOpenApi(sendFriendRequestSchema) })
  @ApiCreatedResponse({ schema: MEMBER_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @ApiConflictResponse({ description: "A relationship already exists" })
  @ApiNotFoundResponse({ description: "User not found" })
  @Post("requests")
  send(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(sendFriendRequestSchema))
    body: SendFriendRequestInput,
  ): Promise<Member> {
    return this.friendsService.sendRequest(user.id, body.userId);
  }

  @ApiOperation({ summary: "Accept an incoming friend request" })
  @ApiOkResponse({ schema: MEMBER_SCHEMA })
  @ApiNotFoundResponse({ description: "Friend request not found" })
  @HttpCode(HttpStatus.OK)
  @Post("requests/:userId/accept")
  accept(
    @CurrentUser() user: AuthUser,
    @Param("userId") userId: string,
  ): Promise<Member> {
    return this.friendsService.acceptRequest(user.id, userId);
  }

  @ApiOperation({
    summary: "Unfriend, decline a request, or cancel a sent request",
  })
  @ApiNoContentResponse({ description: "Relationship removed" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":userId")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("userId") userId: string,
  ): Promise<void> {
    return this.friendsService.remove(user.id, userId);
  }
}
