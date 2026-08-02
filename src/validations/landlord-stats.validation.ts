import { z } from "zod";

export const getRecentInquiriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(5),
});

export type GetRecentInquiriesQuery = z.infer<
  typeof getRecentInquiriesQuerySchema
>;
