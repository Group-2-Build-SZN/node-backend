import { eq, and, asc, ne, sql } from "drizzle-orm";
import { db } from "@/config/database.config";
import { conversations, messages } from "@/db/schema/messaging.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import { getIO, userRoom } from "@/lib/socket";
import type { SendMessageInput } from "@/validations/message.validation";

// Intentionally does not import conversation.service — conversation.service imports
// this module to create the first message of a new thread, and a two-way import
// would create a circular dependency. Participant checks are done inline instead.
async function assertParticipant(userId: string, conversationId: string) {
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

class MessageService {
  async sendMessage(
    senderId: string,
    conversationId: string,
    payload: SendMessageInput,
  ) {
    const conversation = await assertParticipant(senderId, conversationId);

    const [message] = await db
      .insert(messages)
      .values({ conversationId, senderId, content: payload.content })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: message.createdAt })
      .where(eq(conversations.id, conversationId));

    const recipientId =
      conversation.participantOneId === senderId
        ? conversation.participantTwoId
        : conversation.participantOneId;

    // Push over the socket if the recipient is connected; if not, they'll see it
    // on next fetch of /conversations — no separate offline-queue needed for MVP.
    getIO()?.to(userRoom(recipientId)).emit("message:new", {
      conversationId,
      message,
    });

    return message;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    page: number,
    limit: number,
  ) {
    await assertParticipant(userId, conversationId);
    const offset = (page - 1) * limit;

    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markAsRead(userId: string, conversationId: string) {
    await assertParticipant(userId, conversationId);

    const updated = await db
      .update(messages)
      .set({ status: "read", readAt: new Date() })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId),
          sql`${messages.status} != 'read'`,
        ),
      )
      .returning({ id: messages.id, senderId: messages.senderId });

    if (updated.length > 0) {
      getIO()?.to(userRoom(updated[0].senderId)).emit("message:read", {
        conversationId,
        readBy: userId,
      });
    }

    return { markedRead: updated.length };
  }
}

export default new MessageService();
