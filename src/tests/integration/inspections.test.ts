import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "@/tests/helpers/db";
import { generateAccessToken } from "@/utils/jwt.utils";
import { UserRole } from "@/constants/user-role";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";

const app = createApp();

async function createUser(email: string, role: UserRole) {
  const [user] = await db.insert(users).values({ email, role }).returning();
  const token = generateAccessToken({ id: user.id, email: user.email, role });
  return { user, token };
}

async function createPublishedProperty(ownerId: string) {
  const [property] = await db
    .insert(properties)
    .values({
      propertyRef: `ULO-TEST${Math.floor(Math.random() * 10000)}`,
      ownerId,
      listingTitle: "Test property",
      propertyType: "self_contained",
      price: "500000",
      address: "Enugu",
      location: { x: 7.51, y: 6.46 },
      isPublished: true,
    })
    .returning();
  return property;
}

describe("Schedule inspection", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("lets a tenant schedule an inspection on a published property", async () => {
    const { user: agent } = await createUser(
      "agent@example.com",
      UserRole.AGENT,
    );
    const { token: tenantToken } = await createUser(
      "tenant@example.com",
      UserRole.TENANT,
    );
    const property = await createPublishedProperty(agent.id);

    const scheduledAt = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const response = await request(app)
      .post(`/api/v1/properties/${property.id}/inspections`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ scheduledAt, notes: "Prefer morning" });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("pending");
    expect(response.body.data.agentId).toBe(agent.id);
  });

  it("rejects a scheduledAt in the past", async () => {
    const { user: agent } = await createUser(
      "agent2@example.com",
      UserRole.AGENT,
    );
    const { token: tenantToken } = await createUser(
      "tenant2@example.com",
      UserRole.TENANT,
    );
    const property = await createPublishedProperty(agent.id);

    const response = await request(app)
      .post(`/api/v1/properties/${property.id}/inspections`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ scheduledAt: "2020-01-01T10:00:00.000Z" });

    expect(response.status).toBe(422);
  });

  it("lets the agent confirm an inspection but not the tenant", async () => {
    const { user: agent, token: agentToken } = await createUser(
      "agent3@example.com",
      UserRole.AGENT,
    );
    const { token: tenantToken } = await createUser(
      "tenant3@example.com",
      UserRole.TENANT,
    );
    const property = await createPublishedProperty(agent.id);

    const scheduledAt = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const scheduleResponse = await request(app)
      .post(`/api/v1/properties/${property.id}/inspections`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ scheduledAt });
    const inspectionId = scheduleResponse.body.data.id;

    const tenantAttempt = await request(app)
      .patch(`/api/v1/inspections/${inspectionId}/status`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ status: "confirmed" });
    expect(tenantAttempt.status).toBe(403);

    const agentConfirm = await request(app)
      .patch(`/api/v1/inspections/${inspectionId}/status`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ status: "confirmed" });
    expect(agentConfirm.status).toBe(200);
    expect(agentConfirm.body.data.status).toBe("confirmed");
  });

  it("lets the tenant cancel their own inspection", async () => {
    const { user: agent } = await createUser(
      "agent4@example.com",
      UserRole.AGENT,
    );
    const { token: tenantToken } = await createUser(
      "tenant4@example.com",
      UserRole.TENANT,
    );
    const property = await createPublishedProperty(agent.id);

    const scheduledAt = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const scheduleResponse = await request(app)
      .post(`/api/v1/properties/${property.id}/inspections`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ scheduledAt });
    const inspectionId = scheduleResponse.body.data.id;

    const cancelResponse = await request(app)
      .patch(`/api/v1/inspections/${inspectionId}/status`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ status: "cancelled", cancellationReason: "Change of plans" });

    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.body.data.status).toBe("cancelled");
  });
});
