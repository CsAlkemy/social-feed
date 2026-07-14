import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { BlobUploadModule } from "../common/blob-upload.module";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";

@Module({
  imports: [AuthModule, BlobUploadModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
