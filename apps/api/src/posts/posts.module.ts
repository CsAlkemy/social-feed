import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { BlobUploadModule } from "../common/blob-upload.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
  imports: [AuthModule, BlobUploadModule, RealtimeModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
