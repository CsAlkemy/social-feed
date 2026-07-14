import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  createEventSchema,
  cursorQuerySchema,
  type CreateEventInput,
  type CursorQuery,
  type Event as EventEntity,
  type Page,
} from "@repo/library";
import type { HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard, type AuthUser } from "../auth/jwt-auth.guard";
import { BlobUploadService } from "../common/blob-upload.service";
import {
  EVENT_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { EventsService } from "./events.service";

const EVENT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

@ApiTags("events")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@UseGuards(JwtAuthGuard)
@Controller("events")
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly blobUpload: BlobUploadService,
  ) {}

  @ApiOperation({ summary: "List upcoming events (cursor-paginated)" })
  @ApiOkResponse({ schema: pageSchema(EVENT_SCHEMA) })
  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(cursorQuerySchema)) query: CursorQuery,
  ): Promise<Page<EventEntity>> {
    return this.eventsService.list(user.id, query);
  }

  @ApiOperation({ summary: "Create an event" })
  @ApiBody({ schema: zodToOpenApi(createEventSchema) })
  @ApiCreatedResponse({ schema: EVENT_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createEventSchema)) body: CreateEventInput,
  ): Promise<EventEntity> {
    return this.eventsService.create(user.id, body);
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @Post("media/upload-url")
  createMediaUploadUrl(@Body() body: HandleUploadBody, @Req() req: Request) {
    return this.blobUpload.handle(req, body, EVENT_IMAGE_MAX_BYTES);
  }

  @ApiOperation({ summary: "Mark yourself as going to an event" })
  @ApiOkResponse({ schema: EVENT_SCHEMA })
  @ApiNotFoundResponse({ description: "Event not found" })
  @Put(":id/attendance")
  attend(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<EventEntity> {
    return this.eventsService.setAttendance(user.id, id, true);
  }

  @ApiOperation({ summary: "Remove yourself from an event" })
  @ApiOkResponse({ schema: EVENT_SCHEMA })
  @ApiNotFoundResponse({ description: "Event not found" })
  @Delete(":id/attendance")
  unattend(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<EventEntity> {
    return this.eventsService.setAttendance(user.id, id, false);
  }
}
