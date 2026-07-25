import { eq, desc, and } from "drizzle-orm";
import { db } from "@/config/database.config";
import { properties } from "@/db/schema/property.schema";
import { propertyReports } from "@/db/schema/property-reports.schema";
import { verifications, users } from "@/db/schema/users.schema";
import authService from "@/services/auth.service";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type {
  UpdateReportStatusInput,
  UpdatePropertyStatusInput,
  ResolveKycInput,
  BlacklistUserInput,
} from "@/validations/admin.validation";

class AdminService {
  async listReports(propertyId?: string, status?: string) {
    const conditions = [];
    if (propertyId) conditions.push(eq(propertyReports.propertyId, propertyId));
    if (status) conditions.push(eq(propertyReports.status, status as any));

    const query = db
      .select()
      .from(propertyReports)
      .orderBy(desc(propertyReports.createdAt));
    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  }

  async updateReportStatus(reportId: string, payload: UpdateReportStatusInput) {
    const [report] = await db
      .update(propertyReports)
      .set({ status: payload.status })
      .where(eq(propertyReports.id, reportId))
      .returning();

    if (!report) {
      throw AppError(
        "Report not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return report;
  }

  async updatePropertyStatus(
    propertyId: string,
    payload: UpdatePropertyStatusInput,
  ) {
    const [property] = await db
      .update(properties)
      .set({
        availabilityStatus: payload.availabilityStatus,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId))
      .returning();

    if (!property) {
      throw AppError(
        "Property not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return property;
  }

  async listKycReviewNeeded() {
    return db
      .select({ verification: verifications, user: users })
      .from(verifications)
      .innerJoin(users, eq(users.id, verifications.userId))
      .where(eq(verifications.status, "review_needed"))
      .orderBy(desc(verifications.createdAt));
  }

  async resolveKyc(verificationId: string, payload: ResolveKycInput) {
    const [verification] = await db
      .update(verifications)
      .set({
        status: payload.status,
        verifiedAt: payload.status === "verified" ? new Date() : null,
      })
      .where(eq(verifications.id, verificationId))
      .returning();

    if (!verification) {
      throw AppError(
        "Verification not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return verification;
  }

  async setBlacklistStatus(userId: string, payload: BlacklistUserInput) {
    const [user] = await db
      .update(users)
      .set({ isBlacklisted: payload.blacklisted, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw AppError(
        "User not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (payload.blacklisted) {
      await authService.revokeAllSessions(userId);
      await db
        .update(properties)
        .set({ isPublished: false, updatedAt: new Date() })
        .where(eq(properties.ownerId, userId));
    }

    return user;
  }
}

export default new AdminService();
