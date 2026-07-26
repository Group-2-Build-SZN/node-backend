import { z } from "@/lib/zod";

export const requestCodeSchema = z.object({
  email: z.string().trim().email(),
});

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8),
});

export const googleSignInSchema = z.object({
  idToken: z.string().min(1),
});

export const completeProfileSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z
    .string()
    .trim()
    .min(10)
    .regex(/^\d{11}$/, "Phone number must be exactly 11 digits"),
  role: z.enum(["tenant", "agent", "landlord"]),
  referralCode: z.string().trim().optional(),
});

export type RequestCodeInput = z.infer<typeof requestCodeSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type GoogleSignInInput = z.infer<typeof googleSignInSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
