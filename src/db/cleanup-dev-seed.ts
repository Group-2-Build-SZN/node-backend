import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";
import { reviews } from "@/db/schema/reviews.schema";
import { eq } from "drizzle-orm";
import { TEST_USER_ID } from "@/constants/seed-dev";

// One-off cleanup: removes the dummy data inserted by src/db/seed.ts
// (the "2 Bedroom Apartment, New Haven" listing + Test Agent user) from
// wherever DATABASE_URL currently points. Does not touch amenities, since
// that table was empty beforehand and the 5 rows seed.ts added aren't
// necessarily worth removing.
async function cleanup() {
  if (process.env.SEED_CONFIRM !== "yes-seed-production") {
    console.error(
      "Refusing to run: set SEED_CONFIRM=yes-seed-production to confirm.",
    );
    process.exit(1);
  }

  const existingProperties = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.ownerId, TEST_USER_ID));

  for (const property of existingProperties) {
    await db.delete(reviews).where(eq(reviews.propertyId, property.id));
  }
  const deletedProperties = await db
    .delete(properties)
    .where(eq(properties.ownerId, TEST_USER_ID))
    .returning({ id: properties.id, listingTitle: properties.listingTitle });

  await db.delete(users).where(eq(users.id, TEST_USER_ID));

  console.log("Removed properties:", deletedProperties);
  console.log("Removed Test Agent user.");
  process.exit(0);
}

cleanup().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
