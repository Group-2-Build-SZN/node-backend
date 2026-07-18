import { pgTable, uuid, timestamp, boolean, unique } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";

export const referrals = pgTable(
  "referrals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referredId: uuid("referred_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rewardGranted: boolean("reward_granted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("referrals_referred_unique").on(t.referredId)], // one person can only be referred once
);

export type Referral = typeof referrals.$inferSelect;
