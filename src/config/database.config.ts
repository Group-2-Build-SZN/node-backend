import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/config/env.config";
import * as schema from "@/db/schema";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// quick sanity check to ensure the database connection is working
export async function testConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection successful");
  } catch (err) {
    console.error("Database connection failed", err);
    process.exit(1);
  }
}
