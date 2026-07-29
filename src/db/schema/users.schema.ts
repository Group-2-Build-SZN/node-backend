import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "tenant",
  "agent",
  "landlord",
  "admin",
]);

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "prefer_not_to_say",
]);

export const verificationTypeEnum = pgEnum("verification_type", ["nin", "cac"]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending", // Keeps track during the active API call
  "review_needed", // Use if the Dojah API encounters network/service downtime
  "verified",
  "rejected",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  phone: text("phone").unique(),
  role: userRoleEnum("role"),
  googleId: text("google_id").unique(),
  avatarUrl: text("avatar_url"),
  referralCode: text("referral_code").unique(),
  subscriptionCode: text("subscription_code"),
  subscriptionEmailToken: text("subscription_email_token"),
  isPremium: boolean("is_premium").notNull().default(false),
  premiumUntil: timestamp("premium_until"),
  isBlacklisted: boolean("is_blacklisted").notNull().default(false),

  // Extra profile fields (Settings > Profile)
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  city: text("city"),
  country: text("country"),

  // Account preferences (Settings > Account)
  language: text("language").notNull().default("en"),
  timezone: text("timezone").notNull().default("Africa/Lagos"),
  dateFormat: text("date_format").notNull().default("DD/MM/YYYY"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: verificationTypeEnum("type").notNull(),
  idNumberHash: text("id_number_hash").notNull(), // Stores NIN number or CAC RC Number
  idNumberLast4: text("id_number_last4").notNull(),
  status: verificationStatusEnum("status").notNull().default("unverified"),
  providerReference: text("provider_reference"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
