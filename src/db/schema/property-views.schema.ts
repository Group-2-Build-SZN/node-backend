import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";

export const propertyViews = pgTable(
  "property_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  },
  (t) => [unique("property_views_unique").on(t.userId, t.propertyId)],
);

export type PropertyView = typeof propertyViews.$inferSelect;
