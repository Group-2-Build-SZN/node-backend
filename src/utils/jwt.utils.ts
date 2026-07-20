import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "@/config/env.config";
import { UserRole } from "@/constants/user-role";

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole | null;
}

export function generateAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function generateOpaqueRefreshToken() {
  return randomBytes(64).toString("hex");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
