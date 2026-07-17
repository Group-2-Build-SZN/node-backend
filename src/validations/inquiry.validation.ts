import { z } from "zod";

export const submitInquirySchema = z.object({
  message: z.string().trim().max(500).optional(),
});

export type SubmitInquiryInput = z.infer<typeof submitInquirySchema>;
