import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { BlobUploadModule } from "../common/blob-upload.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [AuthModule, BlobUploadModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
