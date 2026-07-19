// temporary
import type { NextFunction, Request, Response } from "express";
import { UserRole } from "@/constants/user-role";
// import { TEST_USER_ID } from "@/constants/seed";
import { verifyAccessToken } from "@/utils/jwt";
import { db } from "@/config/database.config";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1] ?? null;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const payload = verifyAccessToken(token);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.isBlacklisted) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Your account has been blacklisted.",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export const attachUserIfPresent = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const payload = verifyAccessToken(token);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (user && !user.isBlacklisted) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
      };
    }

    next();
  } catch {
    next();
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.user ||
      req.user.role === null ||
      !roles.includes(req.user.role)
    ) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Forbidden",
      });
    }
    next();
  };
};
