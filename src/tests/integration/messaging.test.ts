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

async function createUser(email: string) {
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

describe("Messaging / Live Chat", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("starts a conversation with an initial message", async () => {
    const { user: agent } = await createUser("agent@example.com");
    const { token } = await createUser("tenant@example.com");

    const response = await request(app)
      .post("/api/v1/conversations")
      .set("Authorization", `Bearer ${token}`)
      .send({ recipientId: agent.id, message: "Is this still available?" });

    expect(response.status).toBe(201);
    expect(response.body.data.message.content).toBe("Is this still available?");
  });

  it("reuses the same conversation for the same pair regardless of initiator", async () => {
    const { user: agent, token: agentToken } =
      await createUser("agent2@example.com");
    const { user: tenant, token: tenantToken } = await createUser(
      "tenant2@example.com",
    );

    const first = await request(app)
      .post("/api/v1/conversations")
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ recipientId: agent.id, message: "Hi there" });

    const second = await request(app)
      .post("/api/v1/conversations")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ recipientId: tenant.id, message: "Hello back" });

    expect(first.body.data.conversation.id).toBe(
      second.body.data.conversation.id,
    );
  });

  it("lists conversations with unread count and marks messages read", async () => {
    const { user: agent, token: agentToken } =
      await createUser("agent3@example.com");
    const { token: tenantToken } = await createUser("tenant3@example.com");

    const startResponse = await request(app)
      .post("/api/v1/conversations")
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ recipientId: agent.id, message: "Any updates?" });
    const conversationId = startResponse.body.data.conversation.id;

    const listResponse = await request(app)
      .get("/api/v1/conversations")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(listResponse.body.data[0].unreadCount).toBe(1);

    const readResponse = await request(app)
      .patch(`/api/v1/conversations/${conversationId}/read`)
      .set("Authorization", `Bearer ${agentToken}`);
    expect(readResponse.status).toBe(200);
    expect(readResponse.body.data.markedRead).toBe(1);

    const unreadCountResponse = await request(app)
      .get("/api/v1/conversations/unread-count")
      .set("Authorization", `Bearer ${agentToken}`);
    expect(unreadCountResponse.body.data.unreadCount).toBe(0);
  });

  it("rejects a non-participant from reading messages", async () => {
    const { user: agent, token: agentToken } =
      await createUser("agent4@example.com");
    const { token: tenantToken } = await createUser("tenant4@example.com");
    const { token: strangerToken } = await createUser("stranger@example.com");

    const startResponse = await request(app)
      .post("/api/v1/conversations")
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ recipientId: agent.id, message: "Hey" });
    const conversationId = startResponse.body.data.conversation.id;

    const response = await request(app)
      .get(`/api/v1/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${strangerToken}`);

    expect(response.status).toBe(403);
    void agentToken;
  });
});
