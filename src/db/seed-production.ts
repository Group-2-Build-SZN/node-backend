import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";
import { reviews } from "@/db/schema/reviews.schema";
import { eq } from "drizzle-orm";

// Fixed, dedicated ids so this script is safe to re-run without piling up
// duplicate rows, and so it never touches real user data.
const DEMO_AGENT_ID = "22222222-2222-2222-2222-222222222222";
const DEMO_REVIEWER_ID = "22222222-2222-2222-2222-222222222223";

const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
];

type DemoProperty = {
  listingTitle: string;
  description: string;
  propertyType:
    | "self_contained"
    | "single_room"
    | "one_bedroom_flat"
    | "two_bedroom_flat"
    | "three_bedroom_flat"
    | "duplex"
    | "bungalow"
    | "shared_apartment";
  listingPurpose: "rent" | "sale";
  bedrooms: number;
  bathrooms: number;
  price: string;
  address: string;
  location: { x: number; y: number };
  features: string[];
  reviews: {
    waterRating: number;
    electricityRating: number;
    securityRating: number;
    roadAccessibilityRating: number;
    cleanlinessRating: number;
    reviewText: string;
  }[];
};

const DEMO_PROPERTIES: DemoProperty[] = [
  {
    listingTitle: "2 Bedroom Flat, New Haven",
    description:
      "Bright, fully serviced 2 bedroom flat in a gated New Haven estate, walking distance to New Haven Market.",
    propertyType: "two_bedroom_flat",
    listingPurpose: "rent",
    bedrooms: 2,
    bathrooms: 2,
    price: "1500000",
    address: "New Haven, Enugu",
    location: { x: 7.515, y: 6.461 },
    features: ["parking", "generator", "water_supply", "security"],
    reviews: [
      {
        waterRating: 5,
        electricityRating: 4,
        securityRating: 5,
        roadAccessibilityRating: 4,
        cleanlinessRating: 5,
        reviewText:
          "Lived here for 8 months, water supply is steady and the estate has 24/7 security.",
      },
    ],
  },
  {
    listingTitle: "Self-Contained Studio, Trans-Ekulu",
    description:
      "Compact self-contained unit close to Trans-Ekulu roundabout, ideal for a single tenant or young professional.",
    propertyType: "self_contained",
    listingPurpose: "rent",
    bedrooms: 1,
    bathrooms: 1,
    price: "450000",
    address: "Trans-Ekulu, Enugu",
    location: { x: 7.5241, y: 6.4732 },
    features: ["parking", "water_supply"],
    reviews: [
      {
        waterRating: 4,
        electricityRating: 3,
        securityRating: 4,
        roadAccessibilityRating: 4,
        cleanlinessRating: 4,
        reviewText:
          "Good value for the price, road can get a little muddy after heavy rain.",
      },
    ],
  },
  {
    listingTitle: "3 Bedroom Duplex, GRA",
    description:
      "Modern 3 bedroom duplex in Enugu GRA with a private compound and 24-hour power backup.",
    propertyType: "duplex",
    listingPurpose: "sale",
    bedrooms: 3,
    bathrooms: 4,
    price: "85000000",
    address: "GRA, Enugu",
    location: { x: 7.4931, y: 6.4489 },
    features: ["parking", "generator", "security", "furnished"],
    reviews: [
      {
        waterRating: 5,
        electricityRating: 5,
        securityRating: 5,
        roadAccessibilityRating: 5,
        cleanlinessRating: 5,
        reviewText:
          "Toured this property, finishing is excellent and the neighborhood is very quiet.",
      },
      {
        waterRating: 5,
        electricityRating: 4,
        securityRating: 5,
        roadAccessibilityRating: 5,
        cleanlinessRating: 4,
        reviewText: "Great location, close to the Polo Park area.",
      },
    ],
  },
  {
    listingTitle: "1 Bedroom Flat, Independence Layout",
    description:
      "Cozy 1 bedroom flat in Independence Layout, near shopping and transport links.",
    propertyType: "one_bedroom_flat",
    listingPurpose: "rent",
    bedrooms: 1,
    bathrooms: 1,
    price: "700000",
    address: "Independence Layout, Enugu",
    location: { x: 7.4967, y: 6.4551 },
    features: ["parking", "water_supply", "security"],
    reviews: [
      {
        waterRating: 4,
        electricityRating: 4,
        securityRating: 4,
        roadAccessibilityRating: 5,
        cleanlinessRating: 4,
        reviewText: "Easy access to the main road, landlord is responsive.",
      },
    ],
  },
  {
    listingTitle: "Shared Apartment, Achara Layout",
    description:
      "Furnished room in a shared apartment in Achara Layout, utilities split among tenants.",
    propertyType: "shared_apartment",
    listingPurpose: "rent",
    bedrooms: 1,
    bathrooms: 1,
    price: "280000",
    address: "Achara Layout, Enugu",
    location: { x: 7.4854, y: 6.4278 },
    features: ["water_supply", "furnished"],
    reviews: [
      {
        waterRating: 3,
        electricityRating: 3,
        securityRating: 4,
        roadAccessibilityRating: 4,
        cleanlinessRating: 4,
        reviewText:
          "Friendly flatmates, occasional water shortage in dry season.",
      },
    ],
  },
];

async function seedProduction() {
  if (process.env.SEED_CONFIRM !== "yes-seed-production") {
    console.error(
      "Refusing to run: set SEED_CONFIRM=yes-seed-production to confirm you intend to seed this database.",
    );
    process.exit(1);
  }

  console.log("Seeding demo listings...");

  // Clean up only rows owned by the two dedicated demo users, so reruns
  // don't pile up duplicates and real data is never touched.
  const existingProperties = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.ownerId, DEMO_AGENT_ID));

  for (const property of existingProperties) {
    await db.delete(reviews).where(eq(reviews.propertyId, property.id));
  }
  await db.delete(properties).where(eq(properties.ownerId, DEMO_AGENT_ID));

  await db
    .insert(users)
    .values({
      id: DEMO_AGENT_ID,
      firstName: "Demo",
      lastName: "Agent",
      email: "demo.agent@myulo.app",
      phone: "08020000001",
      role: "agent",
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { firstName: "Demo", lastName: "Agent" },
    });

  await db
    .insert(users)
    .values({
      id: DEMO_REVIEWER_ID,
      firstName: "Demo",
      lastName: "Reviewer",
      email: "demo.reviewer@myulo.app",
      phone: "08020000002",
      role: "tenant",
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { firstName: "Demo", lastName: "Reviewer" },
    });

  for (const demoProperty of DEMO_PROPERTIES) {
    const [property] = await db
      .insert(properties)
      .values({
        ownerId: DEMO_AGENT_ID,
        listingTitle: demoProperty.listingTitle,
        description: demoProperty.description,
        propertyType: demoProperty.propertyType,
        listingPurpose: demoProperty.listingPurpose,
        bedrooms: demoProperty.bedrooms,
        bathrooms: demoProperty.bathrooms,
        price: demoProperty.price,
        address: demoProperty.address,
        location: demoProperty.location,
        photoUrls: PLACEHOLDER_PHOTOS,
        features: demoProperty.features,
        availabilityStatus: "available",
        isPublished: true,
      })
      .returning();

    for (const review of demoProperty.reviews) {
      await db.insert(reviews).values({
        propertyId: property.id,
        reviewerId: DEMO_REVIEWER_ID,
        reviewType: "verified_resident",
        waterRating: review.waterRating,
        electricityRating: review.electricityRating,
        securityRating: review.securityRating,
        roadAccessibilityRating: review.roadAccessibilityRating,
        cleanlinessRating: review.cleanlinessRating,
        reviewText: review.reviewText,
        submittedLat: demoProperty.location.y,
        submittedLng: demoProperty.location.x,
        distanceFromPropertyMetres: 15,
      });
    }

    console.log(`Seeded: ${demoProperty.listingTitle} (${property.id})`);
  }

  console.log(`Done. Seeded ${DEMO_PROPERTIES.length} properties.`);
  process.exit(0);
}

seedProduction().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
