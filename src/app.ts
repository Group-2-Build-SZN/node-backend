import router from "@/routes";
import errorHandler from "@/middlewares/error-handler.middleware";
import AppError from "@/errors/AppError";
import { setupSwagger } from "@/config/swagger.config";
import { corsMiddleware } from "@/middlewares/credentials.middleware";

import { logger } from "@/config/logger.config";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import { apiRateLimiter } from "@/middlewares/rate-limiter.middleware";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(corsMiddleware);
  app.use(pinoHttp({ logger }));
  app.use(apiRateLimiter);
  app.use(cookieParser());

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(StatusCodes.OK).json({ status: "ok" });
  });

  app.use("/api/v1", router);
  setupSwagger(app);

  app.use((req, _res, next) => {
    next(
      AppError(
        `Cannot ${req.method} ${req.originalUrl}`,
        StatusCodes.NOT_FOUND,
        "ROUTE_NOT_FOUND",
      ),
    );
  });

  app.use(errorHandler);

  return app;
}
