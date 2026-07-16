import {
  pgTable,
  uuid,
  text,
  timestamp,
  geometry,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const amenityTypeEnum = pgEnum("amenity_type", [
  "filling_station",
  "shop",
  "market",
  "hospital",
  "school",
  "town_center",
]);

export const amenities = pgTable(
  "amenities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    type: amenityTypeEnum("type").notNull(),
    location: geometry("location", {
      type: "point",
      mode: "xy",
      srid: 4326,
    }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("amenities_location_gist_idx").using("gist", t.location)],
);

export type Amenity = typeof amenities.$inferSelect;
export type NewAmenity = typeof amenities.$inferInsert;
