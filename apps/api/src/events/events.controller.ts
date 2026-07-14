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
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import {
  JwtAuthGuard,
  type AccessTokenPayload,
  type AuthUser,
} from "../auth/jwt-auth.guard";
import {
  EVENT_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
  pageSchema,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import type { Env } from "../config/env";
import { EventsService } from "./events.service";

const EVENT_IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EVENT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

@ApiTags("events")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing or expired access token" })
@Controller("events")
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @ApiOperation({ summary: "List upcoming events (cursor-paginated)" })
  @ApiOkResponse({ schema: pageSchema(EVENT_SCHEMA) })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
          allowedContentTypes: EVENT_IMAGE_CONTENT_TYPES,
          maximumSizeInBytes: EVENT_IMAGE_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Not reached in local dev (no public callback URL); the resulting
        // URL is persisted when the event is created.
      },
    });
  }

  @ApiOperation({ summary: "Mark yourself as going to an event" })
  @ApiOkResponse({ schema: EVENT_SCHEMA })
  @ApiNotFoundResponse({ description: "Event not found" })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Delete(":id/attendance")
  unattend(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
  ): Promise<EventEntity> {
    return this.eventsService.setAttendance(user.id, id, false);
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
