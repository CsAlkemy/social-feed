import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { BlobUploadService } from "./blob-upload.service";

@Module({
  imports: [AuthModule],
  providers: [BlobUploadService],
  exports: [BlobUploadService],
})
export class BlobUploadModule {}
