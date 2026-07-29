import {
  pgTable,
  uuid,
  boolean,
  timestamp,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";

// Every category a user can toggle notifications for. Keep this list in sync with
// NOTIFICATION_CATEGORIES in the notification-preference service/validation layer.
export const notificationCategoryEnum = pgEnum("notification_category", [
  "new_inquiries",
  "messages",
  "inspection_updates",
  "price_drops",
  "saved_property_updates",
  "account_activity",
  "promotions",
]);

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: notificationCategoryEnum("category").notNull(),
    emailEnabled: boolean("email_enabled").notNull().default(true),
    pushEnabled: boolean("push_enabled").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique("notification_preferences_user_category_unique").on(
      t.userId,
      t.category,
    ),
  ],
);

export type NotificationPreference =
  typeof notificationPreferences.$inferSelect;
