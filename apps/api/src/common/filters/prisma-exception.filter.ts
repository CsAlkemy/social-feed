import {
  Catch,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";

import { Prisma } from "../../generated/prisma/client";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const [status, message] =
      exception.code === "P2002"
        ? [HttpStatus.CONFLICT, "Resource already exists"]
        : exception.code === "P2025"
          ? [HttpStatus.NOT_FOUND, "Resource not found"]
          : [HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"];

    response.status(status).json({ statusCode: status, message });
  }
}
