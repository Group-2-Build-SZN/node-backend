import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";

export const transactionStatusEnum = pgEnum("transaction_status", [
  "success",
  "failed",
]);

export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paystackReference: text("paystack_reference").notNull().unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull(),
  cardType: text("card_type"),
  cardLast4: text("card_last4"),
  paidAt: timestamp("paid_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
