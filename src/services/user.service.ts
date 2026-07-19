import { eq, and } from "drizzle-orm";
import { db } from "@/config/database.config";
import { users, verifications } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import cloudinaryClient from "@/lib/cloudinary";

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
