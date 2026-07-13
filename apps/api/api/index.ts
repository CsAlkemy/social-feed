import "reflect-metadata";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import express, { type Request, type Response } from "express";

// Import the COMPILED app (dist), not src: nest build (tsc) emits the
// decorator metadata NestJS DI needs, which esbuild alone cannot produce.
import { AppModule } from "../dist/app.module";
import { setupSwagger } from "../dist/config/swagger";

const app = express();
let ready: Promise<void> | undefined;

async function bootstrap(): Promise<void> {
  const nest = await NestFactory.create(AppModule, new ExpressAdapter(app));
  const config = nest.get(ConfigService);

  nest.setGlobalPrefix("api");
  nest.use(cookieParser());
  nest.enableCors({
    origin: config.get<string>("WEB_ORIGIN"),
    credentials: true,
  });
  setupSwagger(nest);

  await nest.init();
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!ready) ready = bootstrap();
  await ready;
  app(req, res);
}
