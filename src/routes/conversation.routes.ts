import ConversationController from "@/controllers/conversation.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import {
  startConversationSchema,
  sendMessageSchema,
  getMessagesQuerySchema,
} from "@/validations/message.validation";
import { Router } from "express";

const router = Router();

router.post(
  "/",
  authenticate,
  validateSchema(startConversationSchema, "body"),
  ConversationController.startConversation,
);

router.get("/", authenticate, ConversationController.getConversations);

router.get(
  "/unread-count",
  authenticate,
  ConversationController.getUnreadCount,
);

router.get(
  "/:id/messages",
  authenticate,
  validateSchema(getMessagesQuerySchema, "query"),
  ConversationController.getMessages,
);

router.post(
  "/:id/messages",
  authenticate,
  validateSchema(sendMessageSchema, "body"),
  ConversationController.sendMessage,
);

router.patch("/:id/read", authenticate, ConversationController.markAsRead);

export default router;
