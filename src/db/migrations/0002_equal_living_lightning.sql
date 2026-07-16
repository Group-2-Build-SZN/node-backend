ALTER TABLE "reviews" ADD COLUMN "road_accessibility_rating" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "cleanliness_rating" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "amenity_access_rating";