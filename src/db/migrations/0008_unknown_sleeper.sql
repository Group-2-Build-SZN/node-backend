CREATE TYPE "public"."listing_purpose" AS ENUM('rent', 'sale');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('fake_listing', 'scam_or_fraud', 'misleading_information', 'inappropriate_content', 'already_rented_or_sold', 'other');--> statement-breakpoint
CREATE TABLE "property_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_id" text NOT NULL,
	"property_id" uuid NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reason" "report_reason" NOT NULL,
	"description" text,
	"evidence_urls" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "property_reports_reference_id_unique" UNIQUE("reference_id")
);
--> statement-breakpoint
DROP TABLE "property_flags" CASCADE;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "listing_purpose" "listing_purpose" DEFAULT 'rent' NOT NULL;--> statement-breakpoint
ALTER TABLE "property_reports" ADD CONSTRAINT "property_reports_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_reports" ADD CONSTRAINT "property_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;