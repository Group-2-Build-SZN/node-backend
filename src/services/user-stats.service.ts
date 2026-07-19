import { eq, sql } from "drizzle-orm";
import { db } from "@/config/database.config";
import { savedProperties } from "@/db/schema/saved-properties.schema";
import { propertyViews } from "@/db/schema/property-views.schema";
import { inquiries } from "@/db/schema/inquiries.schema";

class UserStatsService {
  async getStats(userId: string) {
    const [savedCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(savedProperties)
      .where(eq(savedProperties.userId, userId));

    const [viewedCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(propertyViews)
      .where(eq(propertyViews.userId, userId));

    const [inquiriesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inquiries)
      .where(eq(inquiries.tenantId, userId));

    return {
      savedProperties: savedCount.count,
      viewedProperties: viewedCount.count,
      inquiriesMade: inquiriesCount.count,
    };
  }
}

export default new UserStatsService();
