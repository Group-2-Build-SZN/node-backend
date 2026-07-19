import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "pending",
  "responded",
  "closed",
]);

export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message"),
  status: inquiryStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Inquiry = typeof inquiries.$inferSelect;
