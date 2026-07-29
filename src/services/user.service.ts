import { randomInt } from "node:crypto";
import argon2 from "argon2";
import { eq, and, gt, desc } from "drizzle-orm";
import { db } from "@/config/database.config";
import { users, verifications } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";
import { emailChangeRequests } from "@/db/schema/email-change.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import cloudinaryClient from "@/lib/cloudinary";
import emailService from "@/services/email.service";
import { env } from "@/config/env.config";
import type {
  UpdateProfileInput,
  UpdateAccountPreferencesInput,
  RequestEmailChangeInput,
  VerifyEmailChangeInput,
} from "@/validations/user.validation";

class UserService {
  async getPublicProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      throw AppError(
        "User not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const [verification] = await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.userId, userId),
          eq(verifications.status, "verified"),
        ),
      );

    const listings = await db
      .select()
      .from(properties)
      .where(
        and(eq(properties.ownerId, userId), eq(properties.isPublished, true)),
      );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      memberSince: user.createdAt,
      isVerified: Boolean(verification),
      listingCount: listings.length,
      listings,
    };
  }

  async getMyProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user)
      throw AppError(
        "User not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    return user;
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const url = await cloudinaryClient.uploadBuffer(
      file.buffer,
      "ulo/avatars",
      "image",
    );
    const [user] = await db
      .update(users)
      .set({ avatarUrl: url, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Settings > Profile
  async updateProfile(userId: string, payload: UpdateProfileInput) {
    const [user] = await db
      .update(users)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw AppError(
        "User not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return user;
  }

  // Settings > Account
  async updateAccountPreferences(
    userId: string,
    payload: UpdateAccountPreferencesInput,
  ) {
    const [user] = await db
      .update(users)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw AppError(
        "User not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return user;
  }

  // Settings > Security — step 1: verify ownership of the OLD email, confirm the
  // NEW email isn't already taken, then send a code to the NEW email address.
  async requestEmailChange(userId: string, payload: RequestEmailChangeInput) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw AppError(
        "User not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (user.email.toLowerCase() !== payload.currentEmail.toLowerCase()) {
      throw AppError(
        "Current email does not match your account",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
    }

    if (payload.newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw AppError(
        "New email must be different from your current email",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.newEmail));
    if (existing) {
      throw AppError(
        "Email address is already in use",
        StatusCodes.CONFLICT,
        ErrorCode.DUPLICATE_ENTRY,
      );
    }

    const code = randomInt(0, 10 ** env.OTP_CODE_LENGTH)
      .toString()
      .padStart(env.OTP_CODE_LENGTH, "0");
    const codeHash = await argon2.hash(code);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await db.insert(emailChangeRequests).values({
      userId,
      newEmail: payload.newEmail,
      codeHash,
      expiresAt,
    });

    await emailService.sendEmailChangeCode(payload.newEmail, code);

    return { message: "Verification code sent to your new email address" };
  }

  // Settings > Security — step 2: verify the code, finalize the email swap.
  async verifyEmailChange(userId: string, payload: VerifyEmailChangeInput) {
    const [latestRequest] = await db
      .select()
      .from(emailChangeRequests)
      .where(
        and(
          eq(emailChangeRequests.userId, userId),
          eq(emailChangeRequests.newEmail, payload.newEmail),
          eq(emailChangeRequests.consumed, false),
          gt(emailChangeRequests.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(emailChangeRequests.createdAt))
      .limit(1);

    if (!latestRequest) {
      throw AppError(
        "Code expired or not found. Please request a new one.",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_EXPIRED_TOKEN,
      );
    }

    const isValid = await argon2.verify(latestRequest.codeHash, payload.code);
    if (!isValid) {
      throw AppError(
        "Invalid code",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_EXPIRED_TOKEN,
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.newEmail));
    if (existing) {
      throw AppError(
        "Email address is already in use",
        StatusCodes.CONFLICT,
        ErrorCode.DUPLICATE_ENTRY,
      );
    }

    await db
      .update(emailChangeRequests)
      .set({ consumed: true })
      .where(eq(emailChangeRequests.id, latestRequest.id));

    const [user] = await db
      .update(users)
      .set({ email: payload.newEmail, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async deleteAccount(userId: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deleted) {
      throw AppError(
        "User not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return true;
  }
}

export default new UserService();
