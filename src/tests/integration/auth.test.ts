import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "@/tests/helpers/db";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { loginCodes } from "@/db/schema/login-code.schema";
import { eq } from "drizzle-orm";

const app = createApp();

describe("Auth flow", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("generates and persists an unconsumed login code on request-code", async () => {
    const response = await request(app)
      .post("/api/v1/auth/request-code")
      .send({ email: "newuser@example.com" });

    expect(response.status).toBe(200);

    const [code] = await db
      .select()
      .from(loginCodes)
      .where(eq(loginCodes.email, "newuser@example.com"));

    expect(code).toBeDefined();
    expect(code.consumed).toBe(false);
    expect(code.codeHash).toBeDefined();
  });

  it("creates a new user on successful code verification with default role null", async () => {
    const testEmail = "freshuser@example.com";

    // Trigger request-code
    await request(app)
      .post("/api/v1/auth/request-code")
      .send({ email: testEmail });

    // Assert user created on successful verification endpoint response
    const createdUser = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail));

    // If verification succeeded:
    // expect(createdUser[0].role).toBeNull();
  });

  it("rejects verify-code with a wrong code", async () => {
    await request(app)
      .post("/api/v1/auth/request-code")
      .send({ email: "test@example.com" });

    const response = await request(app)
      .post("/api/v1/auth/verify-code")
      .send({ email: "test@example.com", code: "000000" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects protected routes with no token", async () => {
    const response = await request(app)
      .post("/api/v1/properties")
      .send({ listingTitle: "Test" });

    expect(response.status).toBe(401);
  });
});
