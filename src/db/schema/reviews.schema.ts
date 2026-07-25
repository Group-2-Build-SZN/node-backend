import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  doublePrecision,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";

export const reviewTypeEnum = pgEnum("review_type", [
  "verified_resident",
  "community_tip",
]);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reviewType: reviewTypeEnum("review_type").notNull(),
  waterRating: integer("water_rating").notNull(),
  electricityRating: integer("electricity_rating").notNull(),
  securityRating: integer("security_rating").notNull(),
  roadAccessibilityRating: integer("road_accessibility_rating").notNull(),
  cleanlinessRating: integer("cleanliness_rating").notNull(),
  reviewText: text("review_text"),
  photoUrls: text("photo_urls").array(),
  submittedLat: doublePrecision("submitted_lat").notNull(),
  submittedLng: doublePrecision("submitted_lng").notNull(),
  distanceFromPropertyMetres: doublePrecision("distance_from_property_metres"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
