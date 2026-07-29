import { z } from "@/lib/zod";

export const recordSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
});

export const getRecentSearchesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type RecordSearchInput = z.infer<typeof recordSearchSchema>;
export type GetRecentSearchesQuery = z.infer<
  typeof getRecentSearchesQuerySchema
>;
