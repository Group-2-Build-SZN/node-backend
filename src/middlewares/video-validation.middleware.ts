import { Readable } from "node:stream";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getVideoDurationInSeconds } from "get-video-duration";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";

// Multer only checks file SIZE (20MB max) — nothing inspects the actual video
// content, so a 2-second clip or a corrupted file currently passes straight
// through. This probes the real container duration via ffprobe before the file
// ever reaches Cloudinary/the property record.
export const MIN_VIDEO_DURATION_SECONDS = 5;
export const MAX_VIDEO_DURATION_SECONDS = 300;

export async function validateVideoDuration(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const files = req.files as { videos?: Express.Multer.File[] } | undefined;
  const videos = files?.videos ?? [];

  if (videos.length === 0) return next();

  try {
    for (const video of videos) {
      const duration = await getVideoDurationInSeconds(
        Readable.from(video.buffer),
        ffprobeInstaller.path,
      );

      if (duration < MIN_VIDEO_DURATION_SECONDS) {
        return next(
          AppError(
            `Video "${video.originalname}" is too short (${duration.toFixed(1)}s). Minimum is ${MIN_VIDEO_DURATION_SECONDS}s.`,
            StatusCodes.BAD_REQUEST,
            ErrorCode.INVALID_INPUT,
          ),
        );
      }

      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        return next(
          AppError(
            `Video "${video.originalname}" is too long (${duration.toFixed(1)}s). Maximum is ${MAX_VIDEO_DURATION_SECONDS}s.`,
            StatusCodes.BAD_REQUEST,
            ErrorCode.INVALID_INPUT,
          ),
        );
      }
    }

    next();
  } catch {
    // ffprobe throws on unreadable/corrupted video streams
    next(
      AppError(
        "One or more videos could not be read — the file may be corrupted or in an unsupported format.",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      ),
    );
  }
}
