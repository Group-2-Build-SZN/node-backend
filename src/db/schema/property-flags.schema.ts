import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";

export const propertyFlags = pgTable(
  "property_flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    flaggerId: uuid("flagger_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("property_flags_unique").on(t.propertyId, t.flaggerId)],
);

export type PropertyFlag = typeof propertyFlags.$inferSelect;
