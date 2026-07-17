import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/config/database.config";
import { savedProperties } from "@/db/schema/saved-properties.schema";
import { properties } from "@/db/schema/property.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";

interface DbErrorWithCause {
  cause?: { code?: string };
}

class SavedPropertyService {
  async saveProperty(userId: string, propertyId: string) {
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

    try {
      const [saved] = await db
        .insert(savedProperties)
        .values({ userId, propertyId })
        .returning();
      return saved;
    } catch (err) {
      const cause = (err as DbErrorWithCause).cause?.code;
      if (cause === "23505") {
        throw AppError(
          "Property already saved",
          StatusCodes.CONFLICT,
          ErrorCode.DUPLICATE_ENTRY,
        );
      }
      throw err;
    }
  }

  async unsaveProperty(userId: string, propertyId: string) {
    const [deleted] = await db
      .delete(savedProperties)
      .where(
        and(
          eq(savedProperties.userId, userId),
          eq(savedProperties.propertyId, propertyId),
        ),
      )
      .returning();

    if (!deleted) {
      throw AppError(
        "Property not saved",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return true;
  }

  async getSavedProperties(userId: string, listingPurpose?: "rent" | "sale") {
    const conditions = [eq(savedProperties.userId, userId)];
    if (listingPurpose)
      conditions.push(eq(properties.listingPurpose, listingPurpose));

    return db
      .select({
        savedAt: savedProperties.createdAt,
        property: properties,
      })
      .from(savedProperties)
      .innerJoin(properties, eq(properties.id, savedProperties.propertyId))
      .where(and(...conditions))
      .orderBy(desc(savedProperties.createdAt));
  }

  async getSavedCounts(userId: string) {
    const rows = await db
      .select({
        listingPurpose: properties.listingPurpose,
        count: sql<number>`count(*)::int`,
      })
      .from(savedProperties)
      .innerJoin(properties, eq(properties.id, savedProperties.propertyId))
      .where(eq(savedProperties.userId, userId))
      .groupBy(properties.listingPurpose);

    const forRent = rows.find((r) => r.listingPurpose === "rent")?.count ?? 0;
    const forSale = rows.find((r) => r.listingPurpose === "sale")?.count ?? 0;

    return { all: forRent + forSale, forRent, forSale };
  }
}

export default new SavedPropertyService();
