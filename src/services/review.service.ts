import { sql, eq } from "drizzle-orm";
import { db } from "@/config/database.config";
import { reviews } from "@/db/schema/reviews.schema";
import { properties } from "@/db/schema/property.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type { CreateReviewInput } from "@/validations/review.validation";

const GEOFENCE_RADIUS_METERS = 150;

class ReviewService {
  async submitReview(
    reviewerId: string,
    propertyId: string,
    payload: CreateReviewInput,
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

    const { submittedLat, submittedLng, ...rest } = payload;

    const distanceResult = await db.execute(
      sql`SELECT ST_Distance(ST_SetSRID(ST_MakePoint(${property.location.x}, ${property.location.y}), 4326)::geography, ST_SetSRID(ST_MakePoint(${submittedLng}, ${submittedLat}), 4326)::geography) AS distance_meters`,
    );

    const distanceRow = distanceResult.rows[0] as { distance_meters: number };
    const distanceMeters = Math.round(distanceRow.distance_meters);
    const reviewType =
      distanceMeters <= GEOFENCE_RADIUS_METERS
        ? "verified_resident"
        : "community_tip";

    const [review] = await db
      .insert(reviews)
      .values({
        ...rest,
        propertyId,
        reviewerId,
        reviewType,
        submittedLat,
        submittedLng,
        distanceFromPropertyMetres: distanceMeters,
      })
      .returning();

    return review;
  }

  async getPropertyReviews(propertyId: string) {
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId));

    return {
      verifiedResident: rows.filter(
        (r) => r.reviewType === "verified_resident",
      ),
      communityTip: rows.filter((r) => r.reviewType === "community_tip"),
    };
  }
}

export default new ReviewService();
