import { eq, sql, and } from "drizzle-orm";
import { db } from "@/config/database.config";
import { properties } from "@/db/schema/property.schema";
import { propertyFlags } from "@/db/schema/property-flags.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";

const FLAG_THRESHOLD = 5;

interface DbErrorWithCause {
  cause?: { code?: string };
}

class PropertyFlagService {
  async flagProperty(propertyId: string, flaggerId: string) {
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
      const result = await db.transaction(async (tx) => {
        await tx.insert(propertyFlags).values({ propertyId, flaggerId });

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
          const [flagged] = await tx
            .update(properties)
            .set({ availabilityStatus: "under_review", updatedAt: new Date() })
            .where(eq(properties.id, propertyId))
            .returning();
          return flagged;
        }

        return updated;
      });

      return result;
    } catch (err) {
      const cause = (err as DbErrorWithCause).cause?.code;
      if (cause === "23505") {
        throw AppError(
          "You have already flagged this property",
          StatusCodes.CONFLICT,
          ErrorCode.DUPLICATE_ENTRY,
        );
      }
      throw err;
    }
  }

  async unflagProperty(propertyId: string, flaggerId: string) {
    const [deleted] = await db
      .delete(propertyFlags)
      .where(
        and(
          eq(propertyFlags.propertyId, propertyId),
          eq(propertyFlags.flaggerId, flaggerId),
        ),
      )
      .returning();

    if (!deleted) {
      throw AppError(
        "You haven't flagged this property",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    await db
      .update(properties)
      .set({
        flagCount: sql`GREATEST (${properties.flagCount} -1,0)`,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId));

    return true;
  }
}

export default new PropertyFlagService();
