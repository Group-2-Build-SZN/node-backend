import { z } from "zod";

export const applyReferralSchema = z.object({
  code: z.string().trim().min(1),
});

export type ApplyReferralInput = z.infer<typeof applyReferralSchema>;
