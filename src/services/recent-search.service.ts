import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/config/database.config";
import { recentSearches } from "@/db/schema/recent-searches.schema";
import type { RecordSearchInput } from "@/validations/recent-search.validation";

const MAX_STORED_SEARCHES_PER_USER = 50;

class RecentSearchService {
  async recordSearch(userId: string, payload: RecordSearchInput) {
    const [search] = await db
      .insert(recentSearches)
      .values({
        userId,
        query: payload.query,
        filters: payload.filters ?? null,
      })
      .returning();

    // Keep the table from growing unbounded per user — trim anything past the cap.
    const stale = await db
      .select({ id: recentSearches.id })
      .from(recentSearches)
      .where(eq(recentSearches.userId, userId))
      .orderBy(desc(recentSearches.createdAt))
      .offset(MAX_STORED_SEARCHES_PER_USER);

    if (stale.length > 0) {
      await db
        .delete(recentSearches)
        .where(sql`${recentSearches.id} = ANY(${stale.map((s) => s.id)})`);
    }

    return search;
  }

  async getRecentSearches(userId: string, limit: number) {
    return db
      .select()
      .from(recentSearches)
      .where(eq(recentSearches.userId, userId))
      .orderBy(desc(recentSearches.createdAt))
      .limit(limit);
  }

  async clearRecentSearches(userId: string) {
    await db.delete(recentSearches).where(eq(recentSearches.userId, userId));
    return true;
  }
}

export default new RecentSearchService();
