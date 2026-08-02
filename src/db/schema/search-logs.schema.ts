import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { properties } from "@/db/schema/property.schema";
import { users } from "@/db/schema/users.schema";

// One row per search performed with a text query. searchTerm is stored
// denormalized (not joined back to recent_searches) so this table stays
// readable on its own and isn't coupled to a tenant-only feature.
export const searchLogs = pgTable(
  "search_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    searchTerm: text("search_term").notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    resultCount: integer("result_count").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("search_logs_created_at_idx").on(t.createdAt)],
);

// One row per (search, matched property) pair — this is what lets us
// answer "how many recent searches matched properties owned by X".
export const searchLogMatches = pgTable(
  "search_log_matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    searchLogId: uuid("search_log_id")
      .notNull()
      .references(() => searchLogs.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
  },
  (t) => [index("search_log_matches_property_id_idx").on(t.propertyId)],
);

export type SearchLog = typeof searchLogs.$inferSelect;
export type SearchLogMatch = typeof searchLogMatches.$inferSelect;
