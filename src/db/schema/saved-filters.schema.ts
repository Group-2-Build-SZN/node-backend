import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";

export const savedFilters = pgTable("saved_filters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  filters: jsonb("filters").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SavedFilter = typeof savedFilters.$inferSelect;
