CREATE TYPE "public"."user_role" AS ENUM('tenant', 'agent', 'landlord');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('nin', 'cac');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('available', 'taken', 'under_review');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('self_contained', 'single_room', 'one_bedroom_flat', 'two_bedroom_flat', 'three_bedroom_flat', 'duplex', 'shared_apartment');--> statement-breakpoint
CREATE TYPE "public"."review_type" AS ENUM('verified_resident', 'community_tip');--> statement-breakpoint
CREATE TYPE "public"."amenity_type" AS ENUM('filling_station', 'shop', 'market', 'hospital', 'school', 'town_center');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"role" "user_role" NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"premium_until" timestamp,
	"is_blacklisted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "verification_type" NOT NULL,
	"id_number" text NOT NULL,
	"status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"smile_job_id" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"listing_title" text NOT NULL,
	"description" text,
	"property_type" "property_type" NOT NULL,
	"bedrooms" integer DEFAULT 0 NOT NULL,
	"bathrooms" integer DEFAULT 0 NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"address" text NOT NULL,
	"location" geometry(point) NOT NULL,
	"video_urls" text[],
	"flag_count" integer DEFAULT 0 NOT NULL,
	"availability_status" "availability_status" DEFAULT 'available' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"flagger_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "property_flags_unique" UNIQUE("property_id","flagger_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"review_type" "review_type" NOT NULL,
	"water_rating" integer NOT NULL,
	"electricity_rating" integer NOT NULL,
	"security_rating" integer NOT NULL,
	"amenity_access_rating" integer NOT NULL,
	"review_text" text,
	"photo_urls" text[],
	"submitted_lat" double precision NOT NULL,
	"submitted_lng" double precision NOT NULL,
	"distance_from_property_metres" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "amenity_type" NOT NULL,
	"location" geometry(point) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_flags" ADD CONSTRAINT "property_flags_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_flags" ADD CONSTRAINT "property_flags_flagger_id_users_id_fk" FOREIGN KEY ("flagger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_location_gist_idx" ON "properties" USING gist ("location");--> statement-breakpoint
CREATE INDEX "amenities_location_gist_idx" ON "amenities" USING gist ("location");