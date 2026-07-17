import { z } from "@/lib/zod";

export const createSavedFilterSchema = z.object({
  name: z.string().trim().min(1).max(50),
  filters: z.record(z.string(), z.any()),
});

export type CreateSavedFilterInput = z.infer<typeof createSavedFilterSchema>;
