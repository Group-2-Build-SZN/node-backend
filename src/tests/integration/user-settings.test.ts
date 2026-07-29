import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "@/tests/helpers/db";
import { generateAccessToken } from "@/utils/jwt.utils";
import { UserRole } from "@/constants/user-role";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { emailChangeRequests } from "@/db/schema/email-change.schema";
import argon2 from "argon2";
import { eq } from "drizzle-orm";

const app = createApp();

async function createTenant(email = "tenant@example.com") {
  const [user] = await db
    .insert(users)
    .values({ email, role: UserRole.TENANT })
    .returning();
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
  });
  return { user, token };
}

describe("User settings", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("updates extra profile fields", async () => {
    const { token } = await createTenant();

    const response = await request(app)
      .patch("/api/v1/users/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dateOfBirth: "1998-04-12",
        gender: "male",
        city: "Lagos",
        country: "Nigeria",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.city).toBe("Lagos");
    expect(response.body.data.country).toBe("Nigeria");
    expect(response.body.data.gender).toBe("male");
  });

  it("rejects a future dateOfBirth", async () => {
    const { token } = await createTenant();

    const response = await request(app)
      .patch("/api/v1/users/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ dateOfBirth: "2099-01-01" });

    expect(response.status).toBe(422);
  });

  it("updates account preferences (language, timezone, date format)", async () => {
    const { token } = await createTenant();

    const response = await request(app)
      .patch("/api/v1/users/me/account")
      .set("Authorization", `Bearer ${token}`)
      .send({
        language: "fr",
        timezone: "Africa/Accra",
        dateFormat: "MM/DD/YYYY",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.language).toBe("fr");
    expect(response.body.data.timezone).toBe("Africa/Accra");
    expect(response.body.data.dateFormat).toBe("MM/DD/YYYY");
  });

  it("returns default notification preferences for every category", async () => {
    const { token } = await createTenant();

    const response = await request(app)
      .get("/api/v1/users/me/notification-preferences")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(
      response.body.data.every(
        (p: { emailEnabled: boolean; pushEnabled: boolean }) =>
          p.emailEnabled === true && p.pushEnabled === true,
      ),
    ).toBe(true);
  });

  it("updates a single notification category without affecting others", async () => {
    const { token } = await createTenant();

    const response = await request(app)
      .patch("/api/v1/users/me/notification-preferences")
      .set("Authorization", `Bearer ${token}`)
      .send({
        preferences: [
          { category: "promotions", emailEnabled: false, pushEnabled: false },
        ],
      });

    expect(response.status).toBe(200);
    const promotions = response.body.data.find(
      (p: { category: string }) => p.category === "promotions",
    );
    const messages = response.body.data.find(
      (p: { category: string }) => p.category === "messages",
    );
    expect(promotions.emailEnabled).toBe(false);
    expect(messages.emailEnabled).toBe(true);
  });

  it("full email-change flow: request then verify", async () => {
    const { user, token } = await createTenant("old@example.com");

    const requestResponse = await request(app)
      .post("/api/v1/users/me/email/request-change")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentEmail: "old@example.com", newEmail: "new@example.com" });

    expect(requestResponse.status).toBe(200);

    const [record] = await db
      .select()
      .from(emailChangeRequests)
      .where(eq(emailChangeRequests.userId, user.id));
    expect(record).toBeDefined();
    expect(record.newEmail).toBe("new@example.com");

    // The real code is never returned by the API — recover it the way the
    // verify endpoint would, by testing against a code we hash ourselves here
    // is not possible without the plaintext, so instead assert the guarded
    // paths directly.
    const wrongCodeResponse = await request(app)
      .post("/api/v1/users/me/email/verify-change")
      .set("Authorization", `Bearer ${token}`)
      .send({ newEmail: "new@example.com", code: "000000" });

    expect(wrongCodeResponse.status).toBe(400);

    // Simulate a known code by inserting our own request row with a known hash,
    // then verifying against it end-to-end.
    const knownCode = "654321";
    await db.insert(emailChangeRequests).values({
      userId: user.id,
      newEmail: "new2@example.com",
      codeHash: await argon2.hash(knownCode),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const verifyResponse = await request(app)
      .post("/api/v1/users/me/email/verify-change")
      .set("Authorization", `Bearer ${token}`)
      .send({ newEmail: "new2@example.com", code: knownCode });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.data.email).toBe("new2@example.com");
  });

  it("rejects email-change request when currentEmail doesn't match", async () => {
    const { token } = await createTenant("real@example.com");

    const response = await request(app)
      .post("/api/v1/users/me/email/request-change")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentEmail: "wrong@example.com", newEmail: "new@example.com" });

    expect(response.status).toBe(400);
  });

  it("rejects email-change request when the new email is already taken", async () => {
    await createTenant("taken@example.com");
    const { token } = await createTenant("me@example.com");

    const response = await request(app)
      .post("/api/v1/users/me/email/request-change")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentEmail: "me@example.com", newEmail: "taken@example.com" });

    expect(response.status).toBe(409);
  });
});
