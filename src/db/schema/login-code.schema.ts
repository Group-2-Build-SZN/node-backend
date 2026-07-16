import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const loginCodes = pgTable("login_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type LoginCode = typeof loginCodes.$inferSelect;
