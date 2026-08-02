import { sql, eq, and, desc } from "drizzle-orm";
import { db } from "@/config/database.config";
import { properties } from "@/db/schema/property.schema";
import { propertyViews } from "@/db/schema/property-views.schema";
import { inquiries } from "@/db/schema/inquiries.schema";
import { users } from "@/db/schema/users.schema";
import { searchLogs, searchLogMatches } from "@/db/schema/search-logs.schema";

class LandlordStatsService {
  // Owner-facing dashboard summary: property counts, view totals, recent
  // search hits, and the single best-performing listing by view count.
  async getStats(ownerId: string) {
    const [totals] = await db
      .select({
        totalProperties: sql<number>`count(*)::int`,
        activeListings: sql<number>`count(*) filter (
          where ${properties.isPublished} = true
          and ${properties.availabilityStatus} = 'available'
        )::int`,
      })
      .from(properties)
      .where(eq(properties.ownerId, ownerId));

    const [viewTotals] = await db
      .select({ totalViews: sql<number>`count(*)::int` })
      .from(propertyViews)
      .innerJoin(properties, eq(propertyViews.propertyId, properties.id))
      .where(eq(properties.ownerId, ownerId));

    const [searchTotals] = await db
      .select({
        recentSearches: sql<number>`count(distinct ${searchLogMatches.searchLogId})::int`,
      })
      .from(searchLogMatches)
      .innerJoin(properties, eq(searchLogMatches.propertyId, properties.id))
      .where(
        and(
          eq(properties.ownerId, ownerId),
          sql`${searchLogMatches.searchLogId} in (
            select id from ${searchLogs} where created_at > now() - interval '7 days'
          )`,
        ),
      );

    const [topProperty] = await db
      .select({
        id: properties.id,
        listingTitle: properties.listingTitle,
        photoUrls: properties.photoUrls,
        price: properties.price,
        viewCount: sql<number>`count(${propertyViews.id})::int`,
      })
      .from(properties)
      .leftJoin(propertyViews, eq(propertyViews.propertyId, properties.id))
      .where(eq(properties.ownerId, ownerId))
      .groupBy(properties.id)
      .orderBy(desc(sql`count(${propertyViews.id})`))
      .limit(1);

    return {
      totalProperties: totals?.totalProperties ?? 0,
      activeListings: totals?.activeListings ?? 0,
      totalViews: viewTotals?.totalViews ?? 0,
      recentSearches: searchTotals?.recentSearches ?? 0,
      topPerformingProperty:
        topProperty && topProperty.viewCount > 0
          ? {
              id: topProperty.id,
              listingTitle: topProperty.listingTitle,
              coverImageUrl: topProperty.photoUrls?.[0] ?? null,
              price: topProperty.price,
              viewCount: topProperty.viewCount,
            }
          : null,
    };
  }

  // Most recent inquiries received across all of this owner's properties.
  async getRecentInquiries(ownerId: string, page = 1, limit = 5) {
    const offset = (page - 1) * limit;

    const [totalResult] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(inquiries)
      .innerJoin(properties, eq(inquiries.propertyId, properties.id))
      .where(eq(properties.ownerId, ownerId));

    const rows = await db
      .select({
        id: inquiries.id,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        propertyId: inquiries.propertyId,
        propertyTitle: properties.listingTitle,
        tenantFirstName: users.firstName,
        tenantLastName: users.lastName,
        tenantAvatarUrl: users.avatarUrl,
      })
      .from(inquiries)
      .innerJoin(properties, eq(inquiries.propertyId, properties.id))
      .innerJoin(users, eq(inquiries.tenantId, users.id))
      .where(eq(properties.ownerId, ownerId))
      .orderBy(desc(inquiries.createdAt))
      .limit(limit)
      .offset(offset);

    const total = totalResult?.total ?? 0;

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new LandlordStatsService();
