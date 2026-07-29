import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "@/tests/helpers/db";
import { generateAccessToken } from "@/utils/jwt.utils";
import { UserRole } from "@/constants/user-role";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";

const app = createApp();

async function createTenant() {
  const [user] = await db
    .insert(users)
    .values({ email: "searcher@example.com", role: UserRole.TENANT })
    .returning();
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
  });
  return { user, token };
}

describe("Recent searches", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("records a search and returns it in most-recent-first order", async () => {
    const { token } = await createTenant();

    await request(app)
      .post("/api/v1/users/me/recent-searches")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: "2 bedroom Enugu" });

    await request(app)
      .post("/api/v1/users/me/recent-searches")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: "self contained Abakpa", filters: { bedrooms: 1 } });

    const response = await request(app)
      .get("/api/v1/users/me/recent-searches")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].query).toBe("self contained Abakpa");
  });

  it("clears all recent searches for the user", async () => {
    const { token } = await createTenant();

    await request(app)
      .post("/api/v1/users/me/recent-searches")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: "duplex New Haven" });

    const clearResponse = await request(app)
      .delete("/api/v1/users/me/recent-searches")
      .set("Authorization", `Bearer ${token}`);
    expect(clearResponse.status).toBe(200);

    const listResponse = await request(app)
      .get("/api/v1/users/me/recent-searches")
      .set("Authorization", `Bearer ${token}`);
    expect(listResponse.body.data).toHaveLength(0);
  });

  it("rejects unauthenticated access", async () => {
    const response = await request(app).get("/api/v1/users/me/recent-searches");
    expect(response.status).toBe(401);
  });
});
