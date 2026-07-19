import { RateLimiterMemory } from "rate-limiter-flexible";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const limiter = new RateLimiterMemory({
  points: 100, // requests
  duration: 60, // per 60 seconds
});

export async function apiRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await limiter.consume(req.ip ?? "unknown");
    next();
  } catch {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        message: "Too many requests. Please slow down.",
        code: "RATE_LIMITED",
      },
    });
  }
}

const otpLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60, // 5 requests per 15 minutes
});

export async function authRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await otpLimiter.consume(req.body?.email ?? req.ip ?? "unknown");
    next();
  } catch {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        message: "Too many code requests. Please try again later.",
        code: "RATE_LIMITED",
      },
    });
  }
}
