import conversationService from "@/services/conversation.service";
import type { GetConversationsQuery } from "@/validations/message.validation";
import messageService from "@/services/message.service";
import type { GetMessagesQuery } from "@/validations/message.validation";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class ConversationController {
  static async startConversation(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await conversationService.startConversation(userId, req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async getConversations(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page, limit, propertyId } =
      req.validatedQuery as GetConversationsQuery;
    const result = await conversationService.getConversations(userId, {
      page,
      limit,
      propertyId,
    });
    return res.status(StatusCodes.OK).json({ success: true, ...result });
  }

  static async getUnreadCount(req: Request, res: Response) {
    const userId = req.user!.id;
    const count = await conversationService.getUnreadCount(userId);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: { unreadCount: count } });
  }

  static async getMessages(req: Request, res: Response) {
    const userId = req.user!.id;
    const conversationId = req.params.id as string;
    const { page, limit } = req.validatedQuery as GetMessagesQuery;
    const data = await messageService.getMessages(
      userId,
      conversationId,
      page,
      limit,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async sendMessage(req: Request, res: Response) {
    const userId = req.user!.id;
    const conversationId = req.params.id as string;
    const data = await messageService.sendMessage(
      userId,
      conversationId,
      req.body,
    );
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async markAsRead(req: Request, res: Response) {
    const userId = req.user!.id;
    const conversationId = req.params.id as string;
    const data = await messageService.markAsRead(userId, conversationId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default ConversationController;
