import { registry } from "@/lib/open-api-registry";
import {
  startConversationSchema,
  sendMessageSchema,
  getMessagesQuerySchema,
} from "@/validations/message.validation";
import { getConversationsQuerySchema } from "@/validations/message.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

const exampleMessage = {
  id: "a1c2e3f4-1111-4a2b-9c3d-4e5f6a7b8c9d",
  conversationId: "b2d3f405-2222-4b3c-8d4e-5f6a7b8c9d0e",
  senderId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
  content: "is this still available?",
  status: "sent",
  readAt: null,
  createdAt: "2026-07-25T23:55:10.389Z",
};

registry.registerPath({
  method: "get",
  path: "/conversations",
  summary:
    "Get conversations list — paginated, optionally filtered by property",
  tags: ["Conversations"],
  security: [{ bearerAuth: [] }],
  request: { query: getConversationsQuerySchema },
  responses: {
    200: {
      description: "Conversations retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
              property: {
                id: "597d6e53-aecc-4471-89db-31db04dd5f56",
                listingTitle: "2 bedroom flat in nsukka",
                photoUrls: [
                  "https://res.cloudinary.com/l7bjl5ep/image/upload/...",
                ],
                price: "2500000.00",
              },
              otherUser: {
                id: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
                firstName: "Chioma",
                lastName: "Okafor",
                avatarUrl:
                  "https://res.cloudinary.com/l7bjl5ep/image/upload/...",
              },
              lastMessage: {
                id: "msg-001",
                content: "Is this still available?",
                status: "read",
                createdAt: "2026-08-02T14:30:45.123Z",
              },
              unreadCount: 0,
              lastMessageAt: "2026-08-02T14:30:45.123Z",
            },
          ],
          pagination: { page: 1, limit: 20, total: 47 },
        }),
      },
    },
    400: {
      description: "Invalid query parameters",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Invalid query parameters",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "post",
  path: "/conversations",
  summary: "Start a conversation, or reuse an existing one for the same pair",
  description:
    "If a conversation already exists between the two participants (for the same property, if provided), the initial message is added to it instead of creating a duplicate thread.",
  tags: ["Conversations"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: startConversationSchema,
          example: {
            recipientId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
            propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
            message: "is this still available?",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Conversation and first message created (or reused)",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            conversation: {
              id: "b2d3f405-2222-4b3c-8d4e-5f6a7b8c9d0e",
              propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
              participantOneId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
              participantTwoId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
              lastMessageAt: "2026-07-25T23:55:10.389Z",
              createdAt: "2026-07-25T23:55:10.389Z",
            },
            message: exampleMessage,
          },
        }),
      },
    },
    400: {
      description:
        "Validation error, or recipientId is the requesting user's own id",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "You can't start a conversation with yourself",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    404: {
      description: "Recipient not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Recipient not found",
            code: "RESOURCE_NOT_FOUND",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/conversations",
  summary: "List the current user's conversations",
  description:
    "Returns each conversation the user participates in, along with the other participant's public profile, the last message, and an unread count for that thread.",
  tags: ["Conversations"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Conversations retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "b2d3f405-2222-4b3c-8d4e-5f6a7b8c9d0e",
              property: {
                id: "597d6e53-aecc-4471-89db-31db04dd5f56",
                listingTitle: "God's power lodge",
              },
              otherUser: {
                id: "7be4fa93-8d56-4bc2-88c5-e95346830679",
                firstName: "Chidi",
                lastName: "Okafor",
                avatarUrl: null,
              },
              lastMessage: exampleMessage,
              unreadCount: 1,
              lastMessageAt: "2026-07-25T23:55:10.389Z",
            },
          ],
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "get",
  path: "/conversations/unread-count",
  summary: "Get the current user's total unread message count",
  description:
    "Sums unread messages across all of the user's conversations — used to drive a badge/dashboard stat.",
  tags: ["Conversations"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Unread count retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: { unreadCount: 3 },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "get",
  path: "/conversations/{id}/messages",
  summary: "Get messages in a conversation, oldest first",
  tags: ["Conversations"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "b2d3f405-2222-4b3c-8d4e-5f6a7b8c9d0e" }),
    }),
    query: getMessagesQuerySchema,
  },
  responses: {
    200: {
      description: "Messages retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [exampleMessage],
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "You're not a participant in this conversation",
      content: {
        "application/json": jsonContent({
          success: false,
          error: { message: "Forbidden", code: "FORBIDDEN" },
        }),
      },
    },
    404: {
      description: "Conversation not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Conversation not found",
            code: "RESOURCE_NOT_FOUND",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/conversations/{id}/messages",
  summary: "Send a message in an existing conversation",
  tags: ["Conversations"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "b2d3f405-2222-4b3c-8d4e-5f6a7b8c9d0e" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: sendMessageSchema,
          example: { content: "sure, does 4pm tomorrow work?" },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Message sent successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: exampleMessage,
        }),
      },
    },
    400: {
      description: "Validation error in request body",
      content: {
        "application/json": jsonContent({
          success: false,
          error: { message: "Validation error", code: "INVALID_INPUT" },
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "You're not a participant in this conversation",
      content: {
        "application/json": jsonContent({
          success: false,
          error: { message: "Forbidden", code: "FORBIDDEN" },
        }),
      },
    },
    404: {
      description: "Conversation not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Conversation not found",
            code: "RESOURCE_NOT_FOUND",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/conversations/{id}/read",
  summary: "Mark all of the other participant's messages as read",
  description:
    "Marks every unread message sent by the other participant in this conversation as read. Notifies them over the socket connection if they're online.",
  tags: ["Conversations"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "b2d3f405-2222-4b3c-8d4e-5f6a7b8c9d0e" }),
    }),
  },
  responses: {
    200: {
      description: "Messages marked as read",
      content: {
        "application/json": jsonContent({
          success: true,
          data: { markedRead: 2 },
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "You're not a participant in this conversation",
      content: {
        "application/json": jsonContent({
          success: false,
          error: { message: "Forbidden", code: "FORBIDDEN" },
        }),
      },
    },
    404: {
      description: "Conversation not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Conversation not found",
            code: "RESOURCE_NOT_FOUND",
          },
        }),
      },
    },
  },
});
