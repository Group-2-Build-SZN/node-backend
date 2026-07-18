import jwt from "jsonwebtoken";
import { env } from "@/config/env.config";
import { UserRole } from "@/constants/user-role";

export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole | null;
}

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export function generateAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
}

export function generateRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}