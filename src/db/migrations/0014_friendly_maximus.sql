CREATE TYPE "public"."report_status" AS ENUM('open', 'under_review', 'resolved', 'dismissed');--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "id_number_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "id_number_last4" text NOT NULL;--> statement-breakpoint
ALTER TABLE "property_reports" ADD COLUMN "status" "report_status" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" DROP COLUMN "id_number";