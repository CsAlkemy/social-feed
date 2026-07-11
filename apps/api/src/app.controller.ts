import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Service health check" })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: { status: { type: "string", example: "ok" } },
    },
  })
  @Get("health")
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
