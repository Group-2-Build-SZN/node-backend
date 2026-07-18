import { eq, desc } from "drizzle-orm";
import { db } from "@/config/database.config";
import { properties } from "@/db/schema/property.schema";
import { inquiries } from "@/db/schema/inquiries.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type { SubmitInquiryInput } from "@/validations/inquiry.validation";

class InquiryService {
  async submitInquiry(
    propertyId: string,
    tenantId: string,
    payload: SubmitInquiryInput,
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

    const [inquiry] = await db
      .insert(inquiries)
      .values({ propertyId, tenantId, message: payload.message })
      .returning();

    return inquiry;
  }

  async getMyInquiries(tenantId: string) {
    return db
      .select({ inquiry: inquiries, property: properties })
      .from(inquiries)
      .innerJoin(properties, eq(properties.id, inquiries.propertyId))
      .where(eq(inquiries.tenantId, tenantId))
      .orderBy(desc(inquiries.createdAt));
  }
}

export default new InquiryService();
