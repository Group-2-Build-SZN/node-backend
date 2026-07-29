import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";

export const recentSearches = pgTable("recent_searches", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  query: text("query"),
  filters: jsonb("filters"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type RecentSearch = typeof recentSearches.$inferSelect;
