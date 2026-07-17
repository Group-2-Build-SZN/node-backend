import { z } from "zod";

export const createReviewSchema = z.object({
  waterRating: z.coerce.number().int().min(1).max(5),
  electricityRating: z.coerce.number().int().min(1).max(5),
  securityRating: z.coerce.number().int().min(1).max(5),
  roadAccessibilityRating: z.coerce.number().int().min(1).max(5),
  cleanlinessRating: z.coerce.number().int().min(1).max(5),
  reviewText: z.string().trim().max(1000).optional(),
  submittedLat: z.coerce.number().min(-90).max(90),
  submittedLng: z.coerce.number().min(-180).max(180),
});

export const getReviewsQuerySchenma = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchenma>;
