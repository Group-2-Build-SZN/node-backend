import { randomInt } from "node:crypto";
import argon2 from "argon2";
import { eq, and, gt, desc } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { UserRole } from "@/constants/user-role";
import { loginCodes } from "@/db/schema/login-code.schema";
import { refreshTokens } from "@/db/schema/refresh-token.schema";
import emailService from "@/services/email.service";
import referralService from "@/services/referral.service";
import {
  generateAccessToken,
  generateOpaqueRefreshToken,
  hashRefreshToken,
} from "@/utils/jwt.utils";
import { env } from "@/config/env.config";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type {
  RequestCodeInput,
  VerifyCodeInput,
  GoogleSignInInput,
  CompleteProfileInput,
} from "@/validations/auth.validation";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const REFRESH_TOKEN_DAYS = 30;

interface DbErrorWithCause {
  cause?: { code?: string };
}

interface RequestMeta {
  userAgent?: string;
  ip?: string;
}

class AuthService {
  async requestCode(payload: RequestCodeInput) {
    const code = randomInt(0, 10 ** env.OTP_CODE_LENGTH)
      .toString()
      .padStart(env.OTP_CODE_LENGTH, "0");
    const codeHash = await argon2.hash(code);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await db
      .insert(loginCodes)
      .values({ email: payload.email, codeHash, expiresAt });
    await emailService.sendLoginCode(payload.email, code);

    return { message: "Verification code sent to your email" };
  }

  async verifyCode(payload: VerifyCodeInput, meta: RequestMeta) {
    const [latestCode] = await db
      .select()
      .from(loginCodes)
      .where(
        and(
          eq(loginCodes.email, payload.email),
          eq(loginCodes.consumed, false),
          gt(loginCodes.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(loginCodes.createdAt))
      .limit(1);

    if (!latestCode) {
      throw AppError(
        "Code expired or not found. Please request a new one.",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_EXPIRED_TOKEN,
      );
    }

    const isValid = await argon2.verify(latestCode.codeHash, payload.code);
    if (!isValid) {
      throw AppError(
        "Invalid code",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_EXPIRED_TOKEN,
      );
    }

    await db
      .update(loginCodes)
      .set({ consumed: true })
      .where(eq(loginCodes.id, latestCode.id));

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email));

    if (!user) {
      [user] = await db
        .insert(users)
        .values({ email: payload.email })
        .returning();
    }

    if (user.isBlacklisted) {
      throw AppError(
        "This account has been suspended",
        StatusCodes.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    return this.issueTokens(user, meta);
  }

  async googleSignIn(payload: GoogleSignInInput, meta: RequestMeta) {
    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const googlePayload = ticket.getPayload();

    if (!googlePayload?.email) {
      throw AppError(
        "Invalid Google token",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
    }

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googlePayload.sub));

    if (!user) {
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, googlePayload.email));

      if (user) {
        [user] = await db
          .update(users)
          .set({ googleId: googlePayload.sub })
          .where(eq(users.id, user.id))
          .returning();
      } else {
        [user] = await db
          .insert(users)
          .values({
            email: googlePayload.email,
            googleId: googlePayload.sub,
            firstName: googlePayload.given_name ?? null,
            lastName: googlePayload.family_name ?? null,
            avatarUrl: googlePayload.picture ?? null,
          })
          .returning();
      }
    }

    if (user.isBlacklisted) {
      throw AppError(
        "This account has been suspended",
        StatusCodes.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    return this.issueTokens(user, meta);
  }

  async completeProfile(userId: string, payload: CompleteProfileInput) {
    let user;

    try {
      [user] = await db
        .update(users)
        .set({
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone,
          role: payload.role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
    } catch (err) {
      const cause = (err as DbErrorWithCause).cause?.code;
      if (cause === "23505") {
        throw AppError(
          "This phone number is already registered to another account",
          StatusCodes.CONFLICT,
          ErrorCode.DUPLICATE_ENTRY,
        );
      }
      throw err;
    }

    if (!user) {
      throw AppError(
        "User not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (payload.referralCode) {
      try {
        await referralService.applyReferralCode(userId, payload.referralCode);
      } catch {
        // an invalid/expired referral code shouldn't block onboarding completion
      }
    }

    return user;
  }

  // Rotates the refresh token on every use: the old one is revoked, a new one issued.
  // A stolen-but-unused refresh token becomes worthless the moment the real owner refreshes again.
  async refresh(refreshToken: string, meta: RequestMeta) {
    const tokenHash = hashRefreshToken(refreshToken);

    const [tokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.revoked, false),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      );

    if (!tokenRecord) {
      throw AppError(
        "Invalid or expired refresh token",
        StatusCodes.UNAUTHORIZED,
        ErrorCode.INVALID_EXPIRED_TOKEN,
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, tokenRecord.userId));

    if (!user || user.isBlacklisted) {
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.id, tokenRecord.id));
      throw AppError(
        "Account not found or suspended",
        StatusCodes.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
      );
    }

    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, tokenRecord.id));

    return this.issueTokens(user, meta);
  }

  async logout(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  // Revokes every session for a user — called when blacklisting someone, so existing
  // logged-in sessions are cut off immediately rather than expiring naturally later.
  async revokeAllSessions(userId: string) {
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.userId, userId));
  }

  private async issueTokens(
    user: typeof users.$inferSelect,
    meta: RequestMeta,
  ) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole | null,
    };
    const accessToken = generateAccessToken(payload);

    const refreshToken = generateOpaqueRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
    });

    return { user, accessToken, refreshToken };
  }
}

export default new AuthService();
