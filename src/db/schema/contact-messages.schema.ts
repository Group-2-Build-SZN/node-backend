import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
