import { env } from "@/config/env.config";
import type { CustomError } from "@/types/error.types";
import type { ErrorRequestHandler } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code: string;
    stack?: string;
    cause?: string;
  };
}

// Removing `_next` entirely keeps ESLint perfectly happy,
// while the `ErrorRequestHandler` type ensures Express compatibility!
const errorHandler: ErrorRequestHandler = (
  err: CustomError,
  req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next,
) => {
  const isProduction = env.NODE_ENV === "production";

  const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;

  const message =
    err.isOperational || statusCode < 500
      ? err.message
      : "Something went wrong. Please try again.";

  // Drizzle wraps the real Postgres error inside `.cause` — surface it in dev
  const cause = (err as CustomError & { cause?: { message?: string } }).cause
    ?.message;

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code: err.code ?? getReasonPhrase(statusCode),
      ...(!isProduction && err.stack ? { stack: err.stack } : {}),
      ...(!isProduction && cause ? { cause } : {}),
    },
  };

  if (isProduction) {
    if (statusCode >= 500) {
      console.error("[Error]", {
        path: req.path,
        method: req.method,
        statusCode,
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    console.error("[Error]", err);
    if (cause) console.error("[Postgres cause]", cause);
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
