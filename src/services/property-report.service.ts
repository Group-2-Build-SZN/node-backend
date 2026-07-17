import { randomInt } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/config/database.config";
import { properties } from "@/db/schema/property.schema";
import { propertyReports } from "@/db/schema/property-reports.schema";
import cloudinaryClient from "@/lib/cloudinary";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type { SubmitReportInput } from "@/validations/property-report.validation";

const FLAG_THRESHOLD = 5;

function generateReferenceId() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const random = String(randomInt(10000, 99999));
  return `MU-${y}-${m}-${d}-${random}`;
}

class PropertyReportService {
  async submitReport(
    propertyId: string,
    reporterId: string,
    payload: SubmitReportInput,
    evidenceFiles: Express.Multer.File[],
  ) {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));

    if (!property) {
      throw AppError(
        "Property not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const evidenceUrls = await Promise.all(
      evidenceFiles.map((file) =>
        cloudinaryClient.uploadBuffer(
          file.buffer,
          "ulo/reports/evidence",
          file.mimetype.startsWith("video") ? "video" : "image",
        ),
      ),
    );

    const referenceId = generateReferenceId();

    const result = await db.transaction(async (tx) => {
      const [report] = await tx
        .insert(propertyReports)
        .values({
          referenceId,
          propertyId,
          reporterId,
          reason: payload.reason,
          description: payload.description,
          evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : null,
        })
        .returning();

      const [updated] = await tx
        .update(properties)
        .set({
          flagCount: sql`${properties.flagCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(properties.id, propertyId))
        .returning();

      if (
        updated.flagCount >= FLAG_THRESHOLD &&
        updated.availabilityStatus !== "under_review"
      ) {
        await tx
          .update(properties)
          .set({ availabilityStatus: "under_review", updatedAt: new Date() })
          .where(eq(properties.id, propertyId));
      }

      return report;
    });

    return result;
  }
}

export default new PropertyReportService();
