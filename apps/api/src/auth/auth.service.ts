import { createHash, randomBytes } from "node:crypto";

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type {
  LoginInput,
  RegistrationInput,
  User as UserEntity,
} from "@repo/library";
import bcrypt from "bcryptjs";

import type { Env } from "../config/env";
import { Prisma, type User } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface AuthResult {
  user: UserEntity;
  tokens: AuthTokens;
}

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly refreshTtlDays: number;
  private readonly dummyHash = bcrypt.hash("dummy-password", BCRYPT_ROUNDS);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    config: ConfigService<Env, true>,
  ) {
    this.refreshTtlDays = config.get("REFRESH_TOKEN_TTL_DAYS", {
      infer: true,
    });
  }

  async register(input: RegistrationInput): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email.toLowerCase(),
          passwordHash,
        },
      });

      return {
        user: this.toUserEntity(user),
        tokens: await this.issueTokens(user),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "An account with this email already exists",
        );
      }
      throw error;
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    const passwordValid = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? (await this.dummyHash),
    );

    if (!user || !passwordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return {
      user: this.toUserEntity(user),
      tokens: await this.issueTokens(user),
    };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (stored.revokedAt) {
      // A rotated-out token came back: assume it was stolen and revoke every
      // active session for this user.
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (stored.expiresAt <= new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }

    return {
      user: this.toUserEntity(stored.user),
      tokens: await this.issueTokens(stored.user, stored.id),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException("Account no longer exists");
    }

    return this.toUserEntity(user);
  }

  private async issueTokens(
    user: User,
    rotatedTokenId?: string,
  ): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = randomBytes(48).toString("base64url");
    const refreshTokenExpiresAt = new Date(
      Date.now() + this.refreshTtlDays * 24 * 60 * 60 * 1000,
    );

    const createToken = this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    if (rotatedTokenId) {
      await this.prisma.$transaction([
        this.prisma.refreshToken.update({
          where: { id: rotatedTokenId },
          data: { revokedAt: new Date() },
        }),
        createToken,
      ]);
    } else {
      await createToken;
    }

    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private toUserEntity(user: User): UserEntity {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
