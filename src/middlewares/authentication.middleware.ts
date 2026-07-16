// temporary
import type { NextFunction, Request, Response } from "express";
import { UserRole } from "@/constants/user-role";
import { TEST_USER_ID } from "@/constants/seed";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  req.user = {
    id: TEST_USER_ID,
    email: "test@example.com",
    role: UserRole.AGENT,
  };
  next();
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};
