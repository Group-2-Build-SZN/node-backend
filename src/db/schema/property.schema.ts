import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
  geometry,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";

export const propertyTypeEnum = pgEnum("property_type", [
  "self_contained",
  "single_room",
  "one_bedroom_flat",
  "two_bedroom_flat",
  "three_bedroom_flat",
  "duplex",
  "bungalow",
  "shared_apartment",
]);

export const availabilityStatusEnum = pgEnum("availability_status", [
  "available",
  "taken",
  "under_review",
]);

export const listingPurposeEnum = pgEnum("listing_purpose", ["rent", "sale"]);

export const properties = pgTable(
  "properties",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingTitle: text("listing_title").notNull(),
    listingPurpose: listingPurposeEnum("listing_purpose")
      .notNull()
      .default("rent"),
    description: text("description"),
    propertyType: propertyTypeEnum("property_type").notNull(),
    bedrooms: integer("bedrooms").notNull().default(0),
    bathrooms: integer("bathrooms").notNull().default(0),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    address: text("address").notNull(),
    location: geometry("location", {
      type: "Point",
      mode: "xy",
      srid: 4326,
    }).notNull(),
    videoUrls: text("video_urls").array(),
    photoUrls: text("photo_urls").array(),
    features: text("features").array(), //e.g.["parking","generator"]
    flagCount: integer("flag_count").notNull().default(0),
    availabilityStatus: availabilityStatusEnum("availability_status")
      .notNull()
      .default("available"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("properties_location_gist_idx").using("gist", t.location)],
);

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
