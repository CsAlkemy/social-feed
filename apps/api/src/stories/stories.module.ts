import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { BlobUploadModule } from "../common/blob-upload.module";
import { StoriesController } from "./stories.controller";
import { StoriesService } from "./stories.service";

@Module({
  imports: [AuthModule, BlobUploadModule],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
