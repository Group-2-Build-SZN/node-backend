ALTER TYPE "public"."verification_status" ADD VALUE 'review_needed' BEFORE 'verified';--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "provider_reference" text;--> statement-breakpoint
ALTER TABLE "verifications" DROP COLUMN "smile_job_id";