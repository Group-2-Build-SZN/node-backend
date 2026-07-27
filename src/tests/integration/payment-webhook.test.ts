import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import crypto from "node:crypto";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "@/tests/helpers/db";
import { env } from "@/config/env.config";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";

const app = createApp();

function signPayload(payload: object) {
  const rawBody = JSON.stringify(payload);
  return crypto
    .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
}

describe("Paystack webhook", () => {
  beforeEach(async () => {
    await clearDatabase();
    await db
      .insert(users)
      .values({
        email: "subscriber@example.com",
        isPremium: false,
      })
      .onConflictDoNothing();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("activates premium on a valid charge.success event", async () => {
    // Ensure subscriber row exists for this test context
    await db
      .insert(users)
      .values({
        email: "subscriber@example.com",
        isPremium: false,
      })
      .onConflictDoNothing();

    const payload = {
      event: "charge.success",
      data: {
        customer: { email: "subscriber@example.com" },
        reference: "ref_" + Date.now(),
        amount: 750000,
        authorization: { card_type: "visa", last4: "1234" },
        paid_at: new Date().toISOString(),
      },
    };

    const response = await request(app)
      .post("/api/v1/payments/webhook")
      .set("x-paystack-signature", signPayload(payload))
      .send(payload);

    expect(response.status).toBe(200);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, "subscriber@example.com"));

    expect(user).toBeDefined();
    expect(user.isPremium).toBe(true);
    expect(user.premiumUntil).not.toBeNull();
  });

  it("rejects an event with an invalid signature", async () => {
    const payload = {
      event: "charge.success",
      data: { customer: { email: "subscriber@example.com" } },
    };

    const response = await request(app)
      .post("/api/v1/payments/webhook")
      .set("x-paystack-signature", "not-a-real-signature")
      .send(payload);

    expect(response.status).toBe(401);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, "subscriber@example.com"));

    expect(user.isPremium).toBe(false);
  });

  it("rejects an event with no signature header at all", async () => {
    const response = await request(app)
      .post("/api/v1/payments/webhook")
      .send({ event: "charge.success", data: {} });

    expect(response.status).toBe(400);
  });

  it("deactivates premium on subscription.disable", async () => {
    await db
      .update(users)
      .set({
        isPremium: true,
        premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .where(eq(users.email, "subscriber@example.com"));

    const payload = {
      event: "subscription.disable",
      data: { customer: { email: "subscriber@example.com" } },
    };

    const response = await request(app)
      .post("/api/v1/payments/webhook")
      .set("x-paystack-signature", signPayload(payload))
      .send(payload);

    expect(response.status).toBe(200);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, "subscriber@example.com"));

    expect(user.isPremium).toBe(false);
  });
});
