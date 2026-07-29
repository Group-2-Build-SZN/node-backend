import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users.schema";
import { properties } from "@/db/schema/property.schema";

// A conversation is a 1:1 thread between two users (tenant <-> agent/landlord, or
// tenant <-> support). participantOneId/participantTwoId are always stored with the
// smaller UUID first (see message.service normalizeParticipants) so the unique
// constraint catches the pair regardless of who initiated it.
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").references(() => properties.id, {
      onDelete: "set null",
    }),
    participantOneId: uuid("participant_one_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    participantTwoId: uuid("participant_two_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("conversations_participants_property_unique").on(
      t.participantOneId,
      t.participantTwoId,
      t.propertyId,
    ),
  ],
);

export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "delivered",
  "read",
]);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    status: messageStatusEnum("status").notNull().default("sent"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
