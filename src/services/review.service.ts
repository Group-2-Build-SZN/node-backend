import { sql, eq } from "drizzle-orm";
import { db } from "@/config/database.config";
import { reviews } from "@/db/schema/reviews.schema";
import { properties } from "@/db/schema/property.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type { CreateReviewInput } from "@/validations/review.validation";
import cloudinaryClient from "@/lib/cloudinary";

const GEOFENCE_RADIUS_METERS = 150;

class ReviewService {
  async submitReview(
    reviewerId: string,
    propertyId: string,
    payload: CreateReviewInput,
    photos?: Express.Multer.File[],
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

    const uploadedPhotoUrls = await Promise.all(
      (photos ?? []).map((file) =>
        cloudinaryClient.uploadBuffer(
          file.buffer,
          "ulo/reviews/photos",
          "image",
        ),
      ),
    );

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
        photoUrls: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
      })
      .returning();

    return review;
  }

  async getPropertyReviews(propertyId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const countResult = await db.execute(sql`
    SELECT COUNT(*) AS total FROM reviews WHERE property_id = ${propertyId}
  `);
    const total = Number((countResult.rows[0] as { total: string }).total);

    const rows = await db.execute(sql`
      SELECT r.*, u.first_name AS reviewer_first_name, u.last_name AS reviewer_last_name
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      WHERE r.property_id = ${propertyId}
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
      `);
    return {
      verifiedResident: rows.rows.filter(
        (r: any) => r.review_type === "verified_resident",
      ),
      communityTip: rows.rows.filter(
        (r: any) => r.review_type === "community_tip",
      ),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new ReviewService();
