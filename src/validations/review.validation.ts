import { z } from "zod";

export const createReviewSchema = z.object({
  waterRating: z.coerce.number().int().min(1).max(5),
  electricityRating: z.coerce.number().int().min(1).max(5),
  securityRating: z.coerce.number().int().min(1).max(5),
  roadAccessibilityRating: z.coerce.number().int().min(1).max(5),
  cleanlinessRating: z.coerce.number().int().min(1).max(5),
  reviewText: z.string().trim().max(1000).optional(),
  photoUrls: z.array(z.string().url()).max(5).optional(),
  submittedLat: z.coerce.number().min(-90).max(90),
  submittedLng: z.coerce.number().min(-180).max(180),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
