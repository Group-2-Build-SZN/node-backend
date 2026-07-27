import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "../helpers/db";
import { generateAccessToken } from "@/utils/jwt.utils";
import { UserRole } from "@/constants/user-role";
import { db } from "@/config/database.config";
import { users, verifications } from "@/db/schema/users.schema";

const app = createApp();

async function createVerifiedAgent() {
  const [user] = await db
    .insert(users)
    .values({ email: "agent@example.com", role: UserRole.AGENT })
    .returning();

  await db.insert(verifications).values({
    userId: user.id,
    type: "nin",
    idNumberHash: "fake-hash",
    idNumberLast4: "6789",
    status: "verified",
  });

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
  });
  return { user, token };
}

describe("Property publish gating", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("rejects publish when the property has no photos/videos", async () => {
    const { token } = await createVerifiedAgent();

    const createResponse = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({
        listingTitle: "No media test",
        propertyType: "self_contained",
        price: 500000,
        address: "Enugu",
        latitude: 6.46,
        longitude: 7.51,
      });

    const propertyId = createResponse.body.data.id;

    const publishResponse = await request(app)
      .patch(`/api/v1/properties/${propertyId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(publishResponse.status).toBe(400);
  });
});
