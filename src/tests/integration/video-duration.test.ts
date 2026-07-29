import "@/tests/mocks/integration";
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { clearDatabase, closeDb } from "@/tests/helpers/db";
import { generateAccessToken } from "@/utils/jwt.utils";
import { UserRole } from "@/constants/user-role";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";
import { getVideoDurationInSeconds } from "get-video-duration";

const app = createApp();

async function createAgentWithProperty() {
  const [user] = await db
    .insert(users)
    .values({ email: "agent@example.com", role: UserRole.AGENT })
    .returning();
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: UserRole.AGENT,
  });
  const [property] = await db
    .insert(properties)
    .values({
      propertyRef: "ULO-VIDTEST",
      ownerId: user.id,
      listingTitle: "Video test listing",
      propertyType: "self_contained",
      price: "500000",
      address: "Enugu",
      location: { x: 7.51, y: 6.46 },
    })
    .returning();
  return { user, token, property };
}

describe("Video duration validation on property media upload", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("rejects a video shorter than the minimum duration", async () => {
    vi.mocked(getVideoDurationInSeconds).mockResolvedValueOnce(2);
    const { token, property } = await createAgentWithProperty();

    const response = await request(app)
      .post(`/api/v1/properties/${property.id}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("videos", Buffer.from("fake video bytes"), "clip.mp4");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects a corrupted/unreadable video file", async () => {
    vi.mocked(getVideoDurationInSeconds).mockRejectedValueOnce(
      new Error("ffprobe could not read the file"),
    );
    const { token, property } = await createAgentWithProperty();

    const response = await request(app)
      .post(`/api/v1/properties/${property.id}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("videos", Buffer.from("not a real video"), "broken.mp4");

    expect(response.status).toBe(400);
  });

  it("accepts a video within the valid duration range", async () => {
    vi.mocked(getVideoDurationInSeconds).mockResolvedValueOnce(45);
    const { token, property } = await createAgentWithProperty();

    const response = await request(app)
      .post(`/api/v1/properties/${property.id}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("videos", Buffer.from("fake video bytes"), "clip.mp4");

    expect(response.status).toBe(200);
  });
});
