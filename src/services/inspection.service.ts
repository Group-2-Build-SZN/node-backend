import { eq, and, desc } from "drizzle-orm";
import { db } from "@/config/database.config";
import { inspections } from "@/db/schema/inspections.schema";
import { properties } from "@/db/schema/property.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type {
  ScheduleInspectionInput,
  UpdateInspectionStatusInput,
} from "@/validations/inspection.validation";

class InspectionService {
  async scheduleInspection(
    propertyId: string,
    tenantId: string,
    payload: ScheduleInspectionInput,
  ) {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));

    if (!property || !property.isPublished) {
      throw AppError(
        "Property not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (property.ownerId === tenantId) {
      throw AppError(
        "You can't schedule an inspection on your own listing",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
    }

    const [inspection] = await db
      .insert(inspections)
      .values({
        propertyId,
        tenantId,
        agentId: property.ownerId,
        scheduledAt: new Date(payload.scheduledAt),
        notes: payload.notes,
      })
      .returning();

    return inspection;
  }

  async getMyInspections(tenantId: string) {
    return db
      .select({ inspection: inspections, property: properties })
      .from(inspections)
      .innerJoin(properties, eq(properties.id, inspections.propertyId))
      .where(eq(inspections.tenantId, tenantId))
      .orderBy(desc(inspections.scheduledAt));
  }

  async getInspectionsForAgent(agentId: string) {
    return db
      .select({ inspection: inspections, property: properties })
      .from(inspections)
      .innerJoin(properties, eq(properties.id, inspections.propertyId))
      .where(eq(inspections.agentId, agentId))
      .orderBy(desc(inspections.scheduledAt));
  }

  // Only the agent/landlord who owns the property can confirm/complete/cancel.
  // Tenants cancel through the same endpoint but are restricted to "cancelled".
  async updateStatus(
    userId: string,
    inspectionId: string,
    payload: UpdateInspectionStatusInput,
  ) {
    const [inspection] = await db
      .select()
      .from(inspections)
      .where(eq(inspections.id, inspectionId));

    if (!inspection) {
      throw AppError(
        "Inspection not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const isAgent = inspection.agentId === userId;
    const isTenant = inspection.tenantId === userId;

    if (!isAgent && !isTenant) {
      throw AppError("Forbidden", StatusCodes.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    if (isTenant && !isAgent && payload.status !== "cancelled") {
      throw AppError(
        "Tenants can only cancel an inspection",
        StatusCodes.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    const [updated] = await db
      .update(inspections)
      .set({
        status: payload.status,
        cancellationReason:
          payload.status === "cancelled"
            ? payload.cancellationReason
            : inspection.cancellationReason,
        updatedAt: new Date(),
      })
      .where(and(eq(inspections.id, inspectionId)))
      .returning();

    return updated;
  }
}

export default new InspectionService();
