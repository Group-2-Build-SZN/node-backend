import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";

export const savedProperties = pgTable(
  "saved_properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("saved_properties_unique").on(t.userId, t.propertyId)],
);

export type SavedProperty = typeof savedProperties.$inferSelect;
