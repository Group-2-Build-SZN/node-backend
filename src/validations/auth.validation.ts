import { z } from "zod";

export const requestCodeSchema = z.object({
    email: z.string().trim().email(),
});

export const verifyCodeSchema = z.object({
    email: z.string().trim().email(),
    code: z.string().trim().length(6),
});

export const completeProfileSchema = z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    role: z.enum(["tenant", "agent", "landlord"]),
});

export type RequestCodeInput = z.infer<typeof requestCodeSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export const refreshTokenSchema = z.object({});