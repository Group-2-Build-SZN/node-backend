import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { amenities } from "@/db/schema/amenities.schema";
import { properties } from "@/db/schema/property.schema";
import { reviews } from "@/db/schema/reviews.schema";
import { eq } from "drizzle-orm";
import { TEST_USER_ID } from "@/constants/seed";

async function seed() {
  console.log("Seeding...");

  // Delete records in reverse dependency order to prevent foreign key constraint violations
  const existingProperties = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.ownerId, TEST_USER_ID));

  for (const property of existingProperties) {
    await db.delete(reviews).where(eq(reviews.propertyId, property.id));
  }
  await db.delete(properties).where(eq(properties.ownerId, TEST_USER_ID));
  await db.delete(amenities);
  await db
    .insert(users)
    .values({
      id: TEST_USER_ID,
      firstName: "Test",
      lastName: "Agent",
      email: "test@example.com",
      phone: "08010000000",
      role: "agent",
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { firstName: "Test", lastName: "Agent", email: "test@example.com" },
    });

  // Insert Amenities
  await db.insert(amenities).values([
    {
      name: "Total Filling Station, New Haven",
      type: "filling_station",
      location: { x: 7.5157, y: 6.4623 },
    },
    {
      name: "New Haven Market",
      type: "market",
      location: { x: 7.5169, y: 6.4611 },
    },
    {
      name: "ESUT Teaching Hospital",
      type: "hospital",
      location: { x: 7.5024, y: 6.4547 },
    },
    {
      name: "Command Secondary School",
      type: "school",
      location: { x: 7.5138, y: 6.4599 },
    },
    {
      name: "New Haven Roundabout",
      type: "town_center",
      location: { x: 7.5145, y: 6.4605 },
    },
  ]);

  // Insert Test Property
  const [property] = await db
    .insert(properties)
    .values({
      ownerId: TEST_USER_ID,
      listingTitle: "2 Bedroom Apartment, New Haven",
      description:
        "Spacious and fully serviced 2 bedroom apartment in a secure estate.",
      propertyType: "two_bedroom_flat",
      bedrooms: 2,
      bathrooms: 2,
      price: "1500000",
      address: "New Haven, Enugu",
      location: { x: 7.515, y: 6.461 },
      features: ["parking", "generator", "water_supply", "security"],
      availabilityStatus: "available",
      isPublished: true,
    })
    .returning();

  console.log("Seeded. Test property ID:", property.id);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
