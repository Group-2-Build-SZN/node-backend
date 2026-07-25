import { z } from "@/lib/zod";

export const submitContactMessageSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  email: z.string().email(),
  subject: z.string().trim().min(1).max(50),
  message: z.string().trim().min(1).max(200),
});

export type SubmitContactMessageInput = z.infer<
  typeof submitContactMessageSchema
>;
