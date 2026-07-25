import { sql, eq, gt, and } from "drizzle-orm";
import { db } from "@/config/database.config";
import { reviews } from "@/db/schema/reviews.schema";
import { properties } from "@/db/schema/property.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "@/validations/review.validation";
import cloudinaryClient from "@/lib/cloudinary";

const GEOFENCE_RADIUS_METERS = 150;
const REVIEW_COOLDOWN_DAYS = 30;

class ReviewService {
  async submitReview(
    reviewerId: string,
    propertyId: string,
    payload: CreateReviewInput,
    photos?: Express.Multer.File[],
  ) {
    // Check 30-day cooldown period per user per property
    const cooldownCutoff = new Date(
      Date.now() - REVIEW_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
    );

    const [recentReview] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.reviewerId, reviewerId),
          eq(reviews.propertyId, propertyId),
          gt(reviews.createdAt, cooldownCutoff),
        ),
      );

    if (recentReview) {
      throw AppError(
        "You can only review this property once every 30 days",
        StatusCodes.TOO_MANY_REQUESTS,
        ErrorCode.DUPLICATE_ENTRY,
      );
    }

    //  Validate property existence
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

    //  Compute geofence distance via PostGIS
    const { submittedLat, submittedLng, ...rest } = payload;

    const distanceResult = await db.execute(
      sql`SELECT ST_Distance(
            ST_SetSRID(ST_MakePoint(${property.location.x}, ${property.location.y}), 4326)::geography, 
            ST_SetSRID(ST_MakePoint(${submittedLng}, ${submittedLat}), 4326)::geography
          ) AS distance_meters`,
    );

    const distanceRow = distanceResult.rows[0] as { distance_meters: number };
    const distanceMeters = Math.round(distanceRow.distance_meters);

    // Label review type dynamically based on geofence location
    const reviewType =
      distanceMeters <= GEOFENCE_RADIUS_METERS
        ? "verified_resident"
        : "community_tip";

    // Upload photo buffers to Cloudinary if provided
    const uploadedPhotoUrls = await Promise.all(
      (photos ?? []).map((file) =>
        cloudinaryClient.uploadBuffer(
          file.buffer,
          "ulo/reviews/photos",
          "image",
        ),
      ),
    );

    // Insert review into database
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateReview(
    reviewerId: string,
    reviewId: string,
    payload: UpdateReviewInput,
  ) {
    const [updated] = await db
      .update(reviews)
      .set({ ...payload, updatedAt: new Date() })
      .where(and(eq(reviews.id, reviewId), eq(reviews.reviewerId, reviewerId)))
      .returning();

    if (!updated) {
      throw AppError(
        "Review not found or not owned by you",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return updated;
  }

  async deleteReview(reviewerId: string, reviewId: string) {
    const [deleted] = await db
      .delete(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.reviewerId, reviewerId)))
      .returning();

    if (!deleted) {
      throw AppError(
        "Review not found or not owned by you",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return true;
  }
}

export default new ReviewService();
