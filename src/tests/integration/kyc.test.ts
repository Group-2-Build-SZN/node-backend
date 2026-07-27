import { eq } from "drizzle-orm";
import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";
import crypto from "node:crypto";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "../helpers/db";
import { generateAccessToken } from "@/utils/jwt.utils";
import { UserRole } from "@/constants/user-role";
import { db } from "@/config/database.config";
import { users, verifications } from "@/db/schema/users.schema";
import dojahClient from "@/lib/dojah";

beforeEach(async () => {
  // Clear verifications table before each test run so state doesn't leak
  await db.delete(verifications);
});

const app = createApp();

function hashNin(nin: string) {
  return crypto.createHash("sha256").update(nin).digest("hex");
}

async function createAgent(email = "agent@example.com") {
  const [user] = await db
    .insert(users)
    .values({ email, role: UserRole.AGENT })
    .returning();
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
  });
  return { user, token };
}

describe("KYC verification", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("marks verification as verified when the submitted name matches the provider record", async () => {
    vi.mocked(dojahClient.lookupNin).mockResolvedValueOnce({
      entity: { first_name: "John", last_name: "Adamu" },
    });

    const { token } = await createAgent();

    const response = await request(app)
      .post("/api/v1/kyc/verify-nin")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "John",
        lastName: "Adamu",
        dateOfBirth: "1990-01-01",
        ninNumber: "70123456789",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("verified");
  });

  it("marks verification as review_needed when the name doesn't match", async () => {
    vi.mocked(dojahClient.lookupNin).mockResolvedValueOnce({
      entity: { first_name: "John", last_name: "Adamu" },
    });

    const { token } = await createAgent();

    const response = await request(app)
      .post("/api/v1/kyc/verify-nin")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        ninNumber: "70123456789",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("review_needed");
  });

  it("marks verification as rejected when the provider finds no record", async () => {
    vi.mocked(dojahClient.lookupNin).mockResolvedValueOnce({ entity: null });

    const { token } = await createAgent();

    const response = await request(app)
      .post("/api/v1/kyc/verify-nin")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "John",
        lastName: "Adamu",
        dateOfBirth: "1990-01-01",
        ninNumber: "00000000000",
      });

    expect(response.body.data.status).toBe("rejected");
  });

  it("blocks re-registration of a NIN already tied to a blacklisted user", async () => {
    const { user: blacklistedUser } = await createAgent(
      "blacklisted@example.com",
    );
    await db
      .update(users)
      .set({ isBlacklisted: true })
      .where(eq(users.id, blacklistedUser.id));
    await db.insert(verifications).values({
      userId: blacklistedUser.id,
      type: "nin",
      idNumberHash: hashNin("70123456789"),
      idNumberLast4: "6789",
      status: "verified",
    });

    vi.mocked(dojahClient.lookupNin).mockResolvedValueOnce({
      entity: { first_name: "John", last_name: "Adamu" },
    });

    const { token } = await createAgent("newaccount@example.com");

    const response = await request(app)
      .post("/api/v1/kyc/verify-nin")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "John",
        lastName: "Adamu",
        dateOfBirth: "1990-01-01",
        ninNumber: "70123456789",
      });

    expect(response.status).toBe(403);
  });
});
