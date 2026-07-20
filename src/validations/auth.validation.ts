import { z } from "@/lib/zod";

export const requestCodeSchema = z.object({
    email: z.string().trim().email(),
});

export const verifyCodeSchema = z.object({
    email: z.string().trim().email(),
    code: z.string().trim().min(4).max(8),
});

export const completeProfileSchema = z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    phone: z.string().trim().min(10).max(15),
    role: z.enum(["tenant", "agent", "landlord"]),
    referralCode: z.string().trim().optional(),
});

export type RequestCodeInput = z.infer<typeof requestCodeSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export const refreshTokenSchema = z.object({});
export const googleSignInSchema = z.object({
    idToken: z.string().min(1, "Google ID token is required."),
});
