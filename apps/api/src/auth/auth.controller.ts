import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  loginSchema,
  registrationSchema,
  type LoginInput,
  type RegistrationInput,
  type User as UserEntity,
} from "@repo/library";
import type { CookieOptions, Request, Response } from "express";

import {
  AUTH_RESPONSE_SCHEMA,
  USER_SCHEMA,
  VALIDATION_ERROR_SCHEMA,
} from "../common/docs/api-schemas";
import { zodToOpenApi } from "../common/docs/zod-to-openapi";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import type { Env } from "../config/env";
import { AuthService, type AuthTokens } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { JwtAuthGuard, type AuthUser } from "./jwt-auth.guard";

interface AuthResponse {
  user: UserEntity;
  accessToken: string;
}

const REFRESH_COOKIE = "refresh_token";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Env, true>,
  ) {
    this.isProduction =
      config.get("NODE_ENV", { infer: true }) === "production";
  }

  @ApiOperation({ summary: "Create an account and sign in" })
  @ApiBody({ schema: zodToOpenApi(registrationSchema) })
  @ApiCreatedResponse({ schema: AUTH_RESPONSE_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @ApiConflictResponse({ description: "Email already registered" })
  @Post("register")
  async register(
    @Body(new ZodValidationPipe(registrationSchema)) body: RegistrationInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { user, tokens } = await this.authService.register(body);
    this.setRefreshCookie(res, tokens);
    return { user, accessToken: tokens.accessToken };
  }

  @ApiOperation({ summary: "Sign in with email and password" })
  @ApiBody({ schema: zodToOpenApi(loginSchema) })
  @ApiOkResponse({ schema: AUTH_RESPONSE_SCHEMA })
  @ApiBadRequestResponse({ schema: VALIDATION_ERROR_SCHEMA })
  @ApiUnauthorizedResponse({ description: "Invalid email or password" })
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { user, tokens } = await this.authService.login(body);
    this.setRefreshCookie(res, tokens);
    return { user, accessToken: tokens.accessToken };
  }

  @ApiOperation({
    summary: "Rotate the refresh token and get a new access token",
    description:
      "Reads the `refresh_token` httpOnly cookie set by register/login. " +
      "The old refresh token is revoked and a new one is set; reusing a " +
      "rotated token revokes every active session for the user.",
  })
  @ApiOkResponse({ schema: AUTH_RESPONSE_SCHEMA })
  @ApiUnauthorizedResponse({
    description: "Missing, invalid, expired, or reused refresh token",
  })
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const refreshToken = this.readRefreshCookie(req);

    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const { user, tokens } = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(res, tokens);
    return { user, accessToken: tokens.accessToken };
  }

  @ApiOperation({
    summary: "Sign out",
    description:
      "Revokes the refresh token from the `refresh_token` cookie and clears the cookie.",
  })
  @ApiNoContentResponse({ description: "Logged out" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("logout")
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = this.readRefreshCookie(req);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie(REFRESH_COOKIE, this.cookieOptions());
  }

  @ApiOperation({ summary: "Get the signed-in user" })
  @ApiBearerAuth("access-token")
  @ApiOkResponse({
    schema: { type: "object", properties: { user: USER_SCHEMA } },
  })
  @ApiUnauthorizedResponse({ description: "Missing or expired access token" })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: AuthUser): Promise<{ user: UserEntity }> {
    return { user: await this.authService.me(user.id) };
  }

  private readRefreshCookie(req: Request): string | undefined {
    const cookies = req.cookies as Record<string, string | undefined>;
    return cookies[REFRESH_COOKIE];
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? "none" : "lax",
      path: "/api/auth",
    };
  }

  private setRefreshCookie(res: Response, tokens: AuthTokens): void {
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...this.cookieOptions(),
      expires: tokens.refreshTokenExpiresAt,
    });
  }
}
