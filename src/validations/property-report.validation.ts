import { z } from "zod";

export const reportReasonValues = [
  "fake_listing",
  "scam_or_fraud",
  "misleading_information",
  "inappropriate_content",
  "already_rented_or_sold",
  "other",
] as const;

export const submitReportSchema = z.object({
  reason: z.enum(reportReasonValues),
  description: z.string().trim().max(500).optional(),
});

export type SubmitReportInput = z.infer<typeof submitReportSchema>;
