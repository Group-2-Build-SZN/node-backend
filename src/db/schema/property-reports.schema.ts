import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";

export const reportReasonEnum = pgEnum("report_reason", [
  "fake_listing",
  "scam_or_fraud",
  "misleading_information",
  "inappropriate_content",
  "already_rented_or_sold",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "under_review",
  "resolved",
  "dismissed",
]);

export const propertyReports = pgTable("property_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  referenceId: text("reference_id").notNull().unique(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: reportReasonEnum("reason").notNull(),
  description: text("description"),
  evidenceUrls: text("evidence_urls").array(),
  status: reportStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PropertyReport = typeof propertyReports.$inferSelect;
