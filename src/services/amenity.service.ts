import { sql } from "drizzle-orm";
import { db } from "@/config/database.config";
import type { GetAmenitiesQuery } from "@/validations/amenity.validation";

class AmenityService {
  async getAmenities(query: GetAmenitiesQuery) {
    const { type, lat, lng, radiusKm } = query;

    const rows = await db.execute(sql`
      SELECT
        id,
        name,
        type,
        ST_X(location) AS longitude,
        ST_Y(location) AS latitude
        ${
          lat !== undefined && lng !== undefined
            ? sql`, ROUND(ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)) AS distance_meters`
            : sql``
        }
      FROM amenities
      WHERE 1 = 1
        ${type ? sql`AND type = ${type}::amenity_type` : sql``}
        ${
          lat !== undefined && lng !== undefined
            ? sql`AND ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusKm * 1000})`
            : sql``
        }
      ${
        lat !== undefined && lng !== undefined
          ? sql`ORDER BY location <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`
          : sql`ORDER BY name ASC`
      }
    `);

    return rows.rows;
  }
}

export default new AmenityService();
