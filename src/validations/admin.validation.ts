import { z } from "@/lib/zod";

export const updatePropertyStatusSchema = z.object({
  availabilityStatus: z.enum(["available", "taken", "under_review"]),
});

export const resolveKycSchema = z.object({
  status: z.enum(["verified", "rejected"]),
});

export const blacklistUserSchema = z.object({
  blacklisted: z.boolean(),
});

export type UpdatePropertyStatusInput = z.infer<
  typeof updatePropertyStatusSchema
>;
export type ResolveKycInput = z.infer<typeof resolveKycSchema>;
export type BlacklistUserInput = z.infer<typeof blacklistUserSchema>;
