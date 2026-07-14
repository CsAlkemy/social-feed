import { Module } from "@nestjs/common";

import { BlobUploadService } from "./blob-upload.service";

@Module({
  providers: [BlobUploadService],
  exports: [BlobUploadService],
})
export class BlobUploadModule {}
