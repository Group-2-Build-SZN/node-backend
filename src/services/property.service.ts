import { sql, eq, and } from "drizzle-orm";
import { db } from "@/config/database.config";
import { properties } from "@/db/schema/property.schema";
import { verifications } from "@/db/schema/users.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
  GetPropertiesQuery,
} from "@/validations/property.validation";

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
      })
      .returning();

    return property;
  }

  // property listing screen : search, filters, map/list tohggle, verified-only, card-level trust preview
  async getProperties(query: GetPropertiesQuery) {
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
    } = query;
    const offset = (page - 1) * limit;

    const rows = await db.execute(sql`
      SELECT p.*, COALESCE (ROUND(AVG(r.water_rating)), 0) AS water_score, COALESCE (ROUND(AVG(r.electricity_rating)), 0) AS power_score, COALESCE (ROUND(AVG(r.security_rating)), 0) AS security_score, COALESCE (ROUND(AVG((r.water_rating + r.electricity_rating + r.security_rating + r.road_accessibility_rating + r.cleanliness_rating) / 5.0) / 5 * 100), 0) AS trust_score ${lat !== undefined && lng !== undefined ? sql`, ROUND (ST_Distance(p.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)) AS distance_meters` : sql``}
      FROM properties p 
      LEFT JOIN reviews r ON r.property_id = p.id AND r.review_type = 'verified_resident'
      LEFT JOIN verifications v ON v.user_id = p.owner_id AND v.status = 'verified'
      WHERE p.availability_status = 'available' AND p.is_published = true ${search ? sql`AND (p.listing_title ILIKE ${"%" + search + "%"} OR p.address ILIKE ${"%" + search + "%"})` : sql``} ${
        propertyType && propertyType.length > 0
          ? sql`AND p.property_type = ANY(ARRAY[${sql.join(
              propertyType.map((t) => sql`${t}::property_type`),
              sql`,`,
            )}])`
          : sql``
      } ${bedrooms !== undefined ? sql`AND p.bedrooms = ${bedrooms}` : sql``} ${bathrooms !== undefined ? sql`AND p.bathrooms = ${bathrooms}` : sql``} ${
        features && features.length > 0
          ? sql`AND p.features @> ARRAY[${sql.join(
              features.map((f) => sql`${f}`),
              sql`, `,
            )}]::text[]`
          : sql``
      } ${verifiedOnly ? sql`AND v.id IS NOT NULL` : sql``} ${minPrice ? sql`AND p.price >= ${minPrice}` : sql``} ${maxPrice ? sql`AND p.price <= ${maxPrice}` : sql``} ${lat !== undefined && lng !== undefined ? sql`AND ST_DWithin(p.location:;geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusKm * 1000})` : sql``}
      GROUP BY p.id ${lat !== undefined && lng !== undefined ? sql`ORDER BY p.location <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)` : sql`ORDER BY p.created_at DESC`}
      LIMIT ${limit} OFFSET ${offset}`);

    return rows.rows;
  }

  async getPropertyById(id: string) {
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

    const trekCheck = await this.getTrekCheck(id);
    const trustSummary = await this.getTrustSummary(id);

    return { ...property, trekCheck, trustSummary };
  }

  // trust score + per category bars shown on property details / video walkthrough screens
  async getTrustSummary(propertyId: string) {
    const result = await db.execute(sql`
      SELECT COUNT (*) AS review_count, COALESCE (ROUND(AVG(water_rating), 1), 0) AS water_rating, COALESCE (ROUND(AVG(electricity_rating), 1), 0) AS electricity_rating, COALESCE(ROUND(AVG(security_rating), 1), 0) AS security_rating, COALESCE(ROUND(AVG(road_accessibility_rating), 1), 0) AS road_accessiblity_rating, COALESCE (ROUND(AVG(cleanliness_rating), 1), 0) AS cleanliness_rating, COALESCE (ROUND(AVG((water_rating + electricity_rating + security_rating + road_accessibility_rating + cleanliness_rating) / 5.0) /5 * 100), 0) AS trust_score
      FROM reviews 
      WHERE property_id = ${propertyId} AND review_type = 'verified_resident'`);

    return result.rows[0];
  }

  // "Trek Check" - nearest amenity of each type
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

  async publishProperty(ownerId: string, id: string) {
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
    const [property] = await db
      .update(properties)
      .set({ isPublished: true, updatedAt: new Date() })
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
}

export default new PropertyService();
