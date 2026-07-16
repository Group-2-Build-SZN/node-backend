import { z } from "zod";

export const verifyNinSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-mm-dd format"),
  ninNumber: z.string().trim().length(11, "NIN must be 11 digits"),
});

export const verifyCacSchema = z.object({
  companyName: z.string().trim().min(1),
  rcNumber: z.string().trim().min(1),
});

export type verifyNinInput = z.infer<typeof verifyNinSchema>;
export type verifyCacInput = z.infer<typeof verifyCacSchema>;
