import { sql, eq, and } from "drizzle-orm";
import { db } from "@/config/database.config";
import { properties } from "@/db/schema/property.schema";
import { savedProperties } from "@/db/schema/saved-properties.schema";
import { users, verifications } from "@/db/schema/users.schema";
import { searchLogs, searchLogMatches } from "@/db/schema/search-logs.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
  GetPropertiesQuery,
} from "@/validations/property.validation";
import cloudinaryClient from "@/lib/cloudinary";
import { propertyViews } from "@/db/schema/property-views.schema";

// Human-readable ID for the Property Information panel, e.g. "ULO-8K3F2QZR".
function generatePropertyRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
  let ref = "";
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ULO-${ref}`;
}

class PropertyService {
  async createProperty(ownerId: string, payload: CreatePropertyInput) {
    const { latitude, longitude, price, ...rest } = payload;

    const [property] = await db
      .insert(properties)
      .values({
        ...rest,
        ownerId,
        price: price.toString(),
        location: { x: longitude, y: latitude },
        propertyRef: generatePropertyRef(),
      })
      .returning();

    return property;
  }

  // property listing screen : search, filters, map/list toggle, verified-only, card-level trust preview
  async getProperties(query: GetPropertiesQuery, requestingUserId?: string) {
    const {
      page,
      limit,
      search,
      propertyType,
      bedrooms,
      bathrooms,
      features,
      verifiedOnly,
      minPrice,
      maxPrice,
      lat,
      lng,
      radiusKm,
      listingPurpose,
    } = query;
    const offset = (page - 1) * limit;

    const whereClause = sql`
    p.availability_status = 'available'
    AND p.is_published = true
    ${search ? sql`AND (p.listing_title ILIKE ${"%" + search + "%"} OR p.address ILIKE ${"%" + search + "%"})` : sql``}
    ${
      propertyType && propertyType.length > 0
        ? sql`AND p.property_type = ANY(ARRAY[${sql.join(
            propertyType.map((t) => sql`${t}::property_type`),
            sql`, `,
          )}])`
        : sql``
    }
    ${bedrooms !== undefined ? sql`AND p.bedrooms = ${bedrooms}` : sql``}
    ${bathrooms !== undefined ? sql`AND p.bathrooms = ${bathrooms}` : sql``}
    ${
      features && features.length > 0
        ? sql`AND p.features @> ARRAY[${sql.join(
            features.map((f) => sql`${f}`),
            sql`, `,
          )}]::text[]`
        : sql``
    }
    ${verifiedOnly ? sql`AND v.id IS NOT NULL` : sql``}
    ${minPrice ? sql`AND p.price >= ${minPrice}` : sql``}
    ${maxPrice ? sql`AND p.price <= ${maxPrice}` : sql``}
    ${lat !== undefined && lng !== undefined ? sql`AND ST_DWithin(p.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusKm * 1000})` : sql``}
    ${query.listingPurpose ? sql`AND p.listing_purpose = ${query.listingPurpose}::listing_purpose` : sql``}
  `;

    const countResult = await db.execute(sql`
    SELECT COUNT(DISTINCT p.id) AS total
    FROM properties p
    LEFT JOIN verifications v ON v.user_id = p.owner_id AND v.status = 'verified'
    WHERE ${whereClause}
  `);
    const total = Number((countResult.rows[0] as { total: string }).total);

    const rows = await db.execute(sql`
    SELECT
      p.*,
      COALESCE(ROUND(AVG(r.water_rating)), 0) AS water_score,
      COALESCE(ROUND(AVG(r.electricity_rating)), 0) AS power_score,
      COALESCE(ROUND(AVG(r.security_rating)), 0) AS security_score,
      COALESCE(
        ROUND(
          AVG(
            (r.water_rating + r.electricity_rating + r.security_rating + r.road_accessibility_rating + r.cleanliness_rating) / 5.0
          ) / 5 * 100
        ),
        0
      ) AS trust_score
      ${lat !== undefined && lng !== undefined ? sql`, ROUND(ST_Distance(p.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)) AS distance_meters` : sql``}
      ${requestingUserId ? sql`, (sp.id IS NOT NULL) AS is_saved` : sql`, false AS is_saved`}
    FROM properties p
    LEFT JOIN reviews r ON r.property_id = p.id AND r.review_type = 'verified_resident'
    LEFT JOIN verifications v ON v.user_id = p.owner_id AND v.status = 'verified'
    ${requestingUserId ? sql`LEFT JOIN saved_properties sp ON sp.property_id = p.id AND sp.user_id = ${requestingUserId}` : sql``}
    WHERE ${whereClause}
    GROUP BY p.id${requestingUserId ? sql`, sp.id` : sql``}
    ${lat !== undefined && lng !== undefined ? sql`ORDER BY p.location <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)` : sql`ORDER BY p.created_at DESC`}
    LIMIT ${limit} OFFSET ${offset}
  `);

    // ==================== ADDED CODE HERE ====================
    // Log the search + which properties matched, so owners can later see
    // how often their listings surface in search. Only logged for real
    // text searches (not plain filter/browse calls), and never allowed
    // to block or fail the actual search response.
    if (search && search.trim().length > 0) {
      void this.logSearch(
        search,
        requestingUserId,
        rows.rows as { id: string }[],
      );
    }
    // =========================================================

    return {
      data: rows.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ==================== ADDED PRIVATE METHOD HERE ====================
  private async logSearch(
    searchTerm: string,
    userId: string | undefined,
    matchedProperties: { id: string }[],
  ) {
    try {
      const [log] = await db
        .insert(searchLogs)
        .values({
          searchTerm,
          userId: userId ?? null,
          resultCount: matchedProperties.length,
        })
        .returning();

      if (matchedProperties.length > 0) {
        await db.insert(searchLogMatches).values(
          matchedProperties.map((p) => ({
            searchLogId: log.id,
            propertyId: p.id,
          })),
        );
      }
    } catch (err) {
      // Search logging is best-effort analytics — never let it surface
      // as an error to the user or block their actual search results.
      console.error("Failed to log search:", err);
    }
  }
  // ====================================================================

  async getPropertyById(id: string, requestingUserId?: string) {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id));

    if (!property) {
      throw AppError(
        "Property not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (requestingUserId) {
      await db
        .insert(propertyViews)
        .values({ userId: requestingUserId, propertyId: id })
        .onConflictDoUpdate({
          target: [propertyViews.userId, propertyViews.propertyId],
          set: { viewedAt: new Date() },
        });
    }

    const trekCheck = await this.getTrekCheck(id);
    const trustSummary = await this.getTrustSummary(id);
    const owner = await this.getOwnerInfo(property.ownerId, requestingUserId);

    let isSaved = false;
    if (requestingUserId) {
      const [saved] = await db
        .select()
        .from(savedProperties)
        .where(
          and(
            eq(savedProperties.propertyId, id),
            eq(savedProperties.userId, requestingUserId),
          ),
        );
      isSaved = Boolean(saved);
    }

    return { isSaved, ...property, trekCheck, trustSummary, owner };
  }

  async getOwnerInfo(ownerId: string, requestingUserId?: string) {
    const result = await db.execute(sql`
      SELECT u.id, u.first_name, u.last_name, u.created_at AS member_since, (v.id IS NOT NULL) AS is_verified
      FROM users u
      LEFT JOIN verifications v ON v.user_id = u.id AND v.status='verified'
      WHERE u.id = ${ownerId}
      LIMIT 1
      `);

    const owner = result.rows[0] as {
      id: string;
      first_name: string | null;
      last_name: string | null;
      member_since: string;
      is_verified: boolean;
    };

    let canSeeContact = false;

    if (requestingUserId) {
      const [requester] = await db
        .select()
        .from(users)
        .where(eq(users.id, requestingUserId));
      canSeeContact =
        requester?.id === ownerId ||
        (requester?.isPremium === true &&
          (!requester.premiumUntil || requester.premiumUntil > new Date()));
    }

    if (!canSeeContact) {
      return {
        id: owner.id,
        firstName: owner.first_name,
        memberSince: owner.member_since,
        isVerified: owner.is_verified,
        contact: null,
      };
    }

    const [ownerFull] = await db
      .select()
      .from(users)
      .where(eq(users.id, ownerId));

    return {
      id: owner.id,
      firstName: owner.first_name,
      lastName: owner.last_name,
      memberSince: owner.is_verified,
      contact: {
        phone: ownerFull.phone,
        email: ownerFull.email,
      },
    };
  }

  async getTrustSummary(propertyId: string) {
    const result = await db.execute(sql`
      SELECT COUNT (*) AS review_count, COALESCE (ROUND(AVG(water_rating), 1), 0) AS water_rating, COALESCE (ROUND(AVG(electricity_rating), 1), 0) AS electricity_rating, COALESCE(ROUND(AVG(security_rating), 1), 0) AS security_rating, COALESCE(ROUND(AVG(road_accessibility_rating), 1), 0) AS road_accessiblity_rating, COALESCE (ROUND(AVG(cleanliness_rating), 1), 0) AS cleanliness_rating, COALESCE (ROUND(AVG((water_rating + electricity_rating + security_rating + road_accessibility_rating + cleanliness_rating) / 5.0) /5 * 100), 0) AS trust_score
      FROM reviews 
      WHERE property_id = ${propertyId} AND review_type = 'verified_resident'`);

    return result.rows[0];
  }

  async getTrekCheck(propertyId: string) {
    const result = await db.execute(sql`
            SELECT DISTINCT ON (a.type) a.type, a.name, ROUND(ST_Distance(a.location::geography, p.location::geography)) AS distance_metres
            FROM amenities a, (SELECT location FROM properties WHERE id = ${propertyId}) p
            ORDER BY a.type, a.location <-> p.location  
        `);
    return result.rows;
  }

  async updateProperty(
    ownerId: string,
    id: string,
    payload: UpdatePropertyInput,
  ) {
    const { latitude, longitude, ...rest } = payload;

    const updateData: Record<string, unknown> = {
      ...rest,
      updatedAt: new Date(),
    };
    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = { x: longitude, y: latitude };
    }

    const [property] = await db
      .update(properties)
      .set(updateData)
      .where(and(eq(properties.id, id), eq(properties.ownerId, ownerId)))
      .returning();

    if (!property) {
      throw AppError(
        "Property not found or not owned by you",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return property;
  }

  async getRecommendedProperties(limit = 10) {
    const rows = await db.execute(sql`
    SELECT
      p.*,
      COALESCE(
        ROUND(
          AVG(
            (r.water_rating + r.electricity_rating + r.security_rating + r.road_accessibility_rating + r.cleanliness_rating) / 5.0
          ) / 5 * 100
        ),
        0
      ) AS trust_score
    FROM properties p
    LEFT JOIN reviews r ON r.property_id = p.id AND r.review_type = 'verified_resident'
    WHERE p.availability_status = 'available' AND p.is_published = true
    GROUP BY p.id
    ORDER BY trust_score DESC NULLS LAST, p.created_at DESC
    LIMIT ${limit}
  `);

    return rows.rows;
  }

  async publishProperty(ownerId: string, id: string) {
    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.ownerId, ownerId)));

    if (!property) {
      throw AppError(
        "Property not found or not owned by you",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (!property.photoUrls?.length || !property.videoUrls?.length) {
      throw AppError(
        "At least one photo and one video are required before publishing",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
    }
    const [verification] = await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.userId, ownerId),
          eq(verifications.status, "verified"),
        ),
      );

    if (!verification) {
      throw AppError(
        "You must complete identity verification before publishing a listing",
        StatusCodes.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }
    const [published] = await db
      .update(properties)
      .set({ isPublished: true, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();

    return published;
  }

  async deleteProperty(ownerId: string, id: string) {
    const [property] = await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.ownerId, ownerId)))
      .returning();

    if (!property) {
      throw AppError(
        "Property not found or not owned by you",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return true;
  }

  async addMedia(
    ownerId: string,
    propertyId: string,
    photos: Express.Multer.File[],
    videos: Express.Multer.File[],
  ) {
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(eq(properties.id, propertyId), eq(properties.ownerId, ownerId)),
      );

    if (!property) {
      throw AppError(
        "Property not found or not owned by you",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const uploadedPhotoUrls = await Promise.all(
      photos.map((file) =>
        cloudinaryClient.uploadBuffer(
          file.buffer,
          "ulo/properties/photos",
          "image",
        ),
      ),
    );

    const uploadedVideoUrls = await Promise.all(
      videos.map((file) =>
        cloudinaryClient.uploadBuffer(
          file.buffer,
          "ulo/properties/videos",
          "video",
        ),
      ),
    );

    const [updated] = await db
      .update(properties)
      .set({
        photoUrls: [...(property.photoUrls ?? []), ...uploadedPhotoUrls],
        videoUrls: [...(property.videoUrls ?? []), ...uploadedVideoUrls],
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId))
      .returning();

    return updated;
  }
}

export default new PropertyService();
