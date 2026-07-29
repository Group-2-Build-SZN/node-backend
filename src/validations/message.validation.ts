import { z } from "@/lib/zod";

export const startConversationSchema = z.object({
  recipientId: z.string().uuid(),
  propertyId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(2000),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export const getMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
