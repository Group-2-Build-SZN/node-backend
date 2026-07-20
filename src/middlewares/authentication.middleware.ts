import { verifyAccessToken } from "@/utils/jwt.utils";
import { UserRole } from "@/constants/user-role";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

function extractToken(req: Request): string | null {
  const authheader = req.headers.authorization;
  if (authheader?.startsWith("Bearer ")) return authheader.slice(7);
  return null;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);

  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Authentication required" });
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export const attachUserIfPresent = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    req.user = verifyAccessToken(token);
  } catch {
    // invalid/expired token on a public route — proceed as anonymous rather than rejecting
  }
  next();
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ success: false, message: "Forbidden" });
    }
    next();
  };
};
