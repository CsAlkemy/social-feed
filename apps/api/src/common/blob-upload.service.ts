import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UPLOAD_IMAGE_TYPES } from "@repo/library";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import type { AccessTokenPayload } from "../auth/jwt-auth.guard";
import type { Env } from "../config/env";

@Injectable()
export class BlobUploadService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async handle(req: Request, body: HandleUploadBody, maximumSizeInBytes: number) {
    await this.requireUser(req);

    const token = this.config.get("BLOB_READ_WRITE_TOKEN", { infer: true });
    if (!token) {
      throw new ServiceUnavailableException("Blob storage is not configured");
    }

    return handleUpload({
      token,
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...UPLOAD_IMAGE_TYPES],
        maximumSizeInBytes,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // Not reached in local dev (no public callback URL); the resulting
        // URL is persisted by the client after the upload finishes.
      },
    });
  }

  private async requireUser(req: Request): Promise<void> {
    const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Missing access token");
    }

    try {
      await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }
  }
}
