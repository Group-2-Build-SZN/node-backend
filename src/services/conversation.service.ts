import { eq, and, or, desc, sql } from "drizzle-orm";
import { db } from "@/config/database.config";
import { conversations, messages } from "@/db/schema/messaging.schema";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import messageService from "@/services/message.service";
import type { StartConversationInput } from "@/validations/message.validation";

// Participants are always stored with the lexicographically smaller UUID first,
// so a conversation between A and B is always found regardless of who started it.
function normalizeParticipants(a: string, b: string) {
  return a < b ? [a, b] : [b, a];
}

class ConversationService {
  async startConversation(userId: string, payload: StartConversationInput) {
    if (payload.recipientId === userId) {
      throw AppError(
        "You can't start a conversation with yourself",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
    }

    const [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.recipientId));
    if (!recipient) {
      throw AppError(
        "Recipient not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const [participantOneId, participantTwoId] = normalizeParticipants(
      userId,
      payload.recipientId,
    );

    let [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.participantOneId, participantOneId),
          eq(conversations.participantTwoId, participantTwoId),
          payload.propertyId
            ? eq(conversations.propertyId, payload.propertyId)
            : sql`${conversations.propertyId} IS NULL`,
        ),
      );

    if (!conversation) {
      [conversation] = await db
        .insert(conversations)
        .values({
          participantOneId,
          participantTwoId,
          propertyId: payload.propertyId,
        })
        .returning();
    }

    const message = await messageService.sendMessage(userId, conversation.id, {
      content: payload.message,
    });

    return { conversation, message };
  }

  async getConversations(
    userId: string,
    filters?: {
      page?: number;
      limit?: number;
      propertyId?: string;
    },
  ) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions = [
      or(
        eq(conversations.participantOneId, userId),
        eq(conversations.participantTwoId, userId),
      ),
    ];

    if (filters?.propertyId) {
      whereConditions.push(eq(conversations.propertyId, filters.propertyId));
    }

    // Get total count
    const [countResult] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(conversations)
      .where(and(...whereConditions));

    // Get paginated results
    const rows = await db
      .select({
        conversation: conversations,
        property: properties,
      })
      .from(conversations)
      .leftJoin(properties, eq(properties.id, conversations.propertyId))
      .where(and(...whereConditions))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(limit)
      .offset(offset);

    const results = [];
    for (const row of rows) {
      const otherId =
        row.conversation.participantOneId === userId
          ? row.conversation.participantTwoId
          : row.conversation.participantOneId;
      const [otherUser] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, otherId));

      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, row.conversation.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const [unread] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, row.conversation.id),
            sql`${messages.senderId} != ${userId}`,
            sql`${messages.status} != 'read'`,
          ),
        );

      results.push({
        id: row.conversation.id,
        property: row.property,
        otherUser,
        lastMessage,
        unreadCount: unread?.count ?? 0,
        lastMessageAt: row.conversation.lastMessageAt,
      });
    }

    return {
      data: results,
      pagination: { page, limit, total: countResult?.total ?? 0 },
    };
  }

  // "Messages: 3" dashboard stat
  async getUnreadCount(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .where(
        and(
          or(
            eq(conversations.participantOneId, userId),
            eq(conversations.participantTwoId, userId),
          ),
          sql`${messages.senderId} != ${userId}`,
          sql`${messages.status} != 'read'`,
        ),
      );
    return row?.count ?? 0;
  }

  async assertParticipant(userId: string, conversationId: string) {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conversation) {
      throw AppError(
        "Conversation not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      throw AppError("Forbidden", StatusCodes.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    return conversation;
  }
}

export default new ConversationService();
