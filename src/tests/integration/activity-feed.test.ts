import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "@/tests/helpers/db";
import { generateAccessToken } from "@/utils/jwt.utils";
import { UserRole } from "@/constants/user-role";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";
import { propertyViews } from "@/db/schema/property-views.schema";
import { savedProperties } from "@/db/schema/saved-properties.schema";
import { reviews } from "@/db/schema/reviews.schema";

const app = createApp();

async function createTenant() {
  const [user] = await db
    .insert(users)
    .values({
      email: `activity-${crypto.randomUUID()}@example.com`,
      role: UserRole.TENANT,
    })
    .returning();
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
  });
  return { user, token };
}

async function createProperty(ownerId: string, ref: string) {
  const [property] = await db
    .insert(properties)
    .values({
      propertyRef: ref,
      ownerId,
      listingTitle: `Listing ${ref}`,
      propertyType: "self_contained",
      price: "500000",
      address: "Enugu",
      location: { x: 7.51, y: 6.46 },
      isPublished: true,
    })
    .returning();
  return property;
}

describe("Unified activity feed", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("merges viewed, saved, and reviewed events into one chronological feed", async () => {
    const { user: agent } = await createTenant();
    const { user, token } = await createTenant();
    const viewedProperty = await createProperty(agent.id, "ULO-VIEW1");
    const savedProperty = await createProperty(agent.id, "ULO-SAVE1");
    const reviewedProperty = await createProperty(agent.id, "ULO-REV1");

    await db
      .insert(propertyViews)
      .values({ userId: user.id, propertyId: viewedProperty.id });
    await db
      .insert(savedProperties)
      .values({ userId: user.id, propertyId: savedProperty.id });
    await db.insert(reviews).values({
      propertyId: reviewedProperty.id,
      reviewerId: user.id,
      reviewType: "community_tip",
      waterRating: 4,
      electricityRating: 4,
      securityRating: 4,
      roadAccessibilityRating: 4,
      cleanlinessRating: 4,
      submittedLat: 6.46,
      submittedLng: 7.51,
    });

    const response = await request(app)
      .get("/api/v1/users/me/activity")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    const types = response.body.data.map((row: { type: string }) => row.type);
    expect(types.sort()).toEqual(["reviewed", "saved", "viewed"]);
    expect(response.body.pagination.total).toBe(3);
  });
});
