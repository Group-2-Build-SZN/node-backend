import { db, pool } from "@/config/database.config";
import { sql } from "drizzle-orm";

export async function clearDatabase() {
  await db.execute(sql`
    TRUNCATE TABLE
      users, login_codes, refresh_tokens, verifications,
      properties, amenities, reviews, property_reports,
      saved_properties, saved_filters, inquiries,
      payment_transactions, referrals, contact_messages,
      notification_preferences, recent_searches, inspections,
      conversations, messages, email_change_requests
    RESTART IDENTITY CASCADE
  `);
}

export async function closeDb() {
  await pool.end();
}
