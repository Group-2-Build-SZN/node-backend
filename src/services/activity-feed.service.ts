import { sql } from "drizzle-orm";
import { db } from "@/config/database.config";

interface ActivityFeedRow {
  type: "viewed" | "saved" | "reviewed";
  property_id: string;
  listing_title: string;
  photo_urls: string[] | null;
  occurred_at: string;
}

class ActivityFeedService {
  // Dashboard's "Viewed / Saved / Reviewed" table — a chronological UNION of three
  // existing event tables rather than a new table, so it stays in sync with the
  // underlying features automatically.
  async getActivityFeed(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const countResult = await db.execute(sql`
      SELECT COUNT(*) AS total FROM (
        SELECT id FROM property_views WHERE user_id = ${userId}
        UNION ALL
        SELECT id FROM saved_properties WHERE user_id = ${userId}
        UNION ALL
        SELECT id FROM reviews WHERE reviewer_id = ${userId}
      ) combined
    `);
    const total = Number((countResult.rows[0] as { total: string }).total);

    const rows = await db.execute(sql`
      SELECT type, property_id, listing_title, photo_urls, occurred_at FROM (
        SELECT 'viewed' AS type, pv.property_id, p.listing_title, p.photo_urls, pv.viewed_at AS occurred_at
        FROM property_views pv
        JOIN properties p ON p.id = pv.property_id
        WHERE pv.user_id = ${userId}
        UNION ALL
        SELECT 'saved' AS type, sp.property_id, p.listing_title, p.photo_urls, sp.created_at AS occurred_at
        FROM saved_properties sp
        JOIN properties p ON p.id = sp.property_id
        WHERE sp.user_id = ${userId}
        UNION ALL
        SELECT 'reviewed' AS type, r.property_id, p.listing_title, p.photo_urls, r.created_at AS occurred_at
        FROM reviews r
        JOIN properties p ON p.id = r.property_id
        WHERE r.reviewer_id = ${userId}
      ) combined
      ORDER BY occurred_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const data = (rows.rows as unknown as ActivityFeedRow[]).map((row) => ({
      type: row.type,
      propertyId: row.property_id,
      listingTitle: row.listing_title,
      photoUrls: row.photo_urls,
      occurredAt: row.occurred_at,
    }));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new ActivityFeedService();
