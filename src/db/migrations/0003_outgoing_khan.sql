ALTER TYPE "public"."property_type" ADD VALUE 'bungalow' BEFORE 'shared_apartment';--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "features" text[];