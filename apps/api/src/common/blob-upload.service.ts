import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UPLOAD_IMAGE_TYPES } from "@repo/library";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { Request } from "express";

import type { Env } from "../config/env";

@Injectable()
export class BlobUploadService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  async handle(req: Request, body: HandleUploadBody, maximumSizeInBytes: number) {
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
}
