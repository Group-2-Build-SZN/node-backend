import router from "@/routes";
import errorHandler from "@/middlewares/error-handler.middleware";
import AppError from "@/errors/AppError";
import express from "express";
import { StatusCodes } from "http-status-codes";

export function createApp() {
  const app = express();

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
