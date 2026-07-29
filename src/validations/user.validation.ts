import { z } from "@/lib/zod";

// Settings > Profile
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dateOfBirth must be in YYYY-MM-DD format")
    .refine((val) => new Date(val) < new Date(), {
      message: "dateOfBirth must be in the past",
    })
    .optional(),
  gender: z.enum(["male", "female", "prefer_not_to_say"]).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  country: z.string().trim().min(1).max(100).optional(),
});

// Settings > Account
export const updateAccountPreferencesSchema = z.object({
  language: z
    .string()
    .trim()
    .regex(
      /^[a-z]{2}(-[A-Z]{2})?$/,
      "language must be an ISO-639 code, e.g. 'en'",
    )
    .optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),
});

// Settings > Notifications
export const notificationCategoryValues = [
  "new_inquiries",
  "messages",
  "inspection_updates",
  "price_drops",
  "saved_property_updates",
  "account_activity",
  "promotions",
] as const;

export const updateNotificationPreferencesSchema = z.object({
  preferences: z
    .array(
      z.object({
        category: z.enum(notificationCategoryValues),
        emailEnabled: z.boolean().optional(),
        pushEnabled: z.boolean().optional(),
      }),
    )
    .min(1),
});

// Settings > Security — email change
export const requestEmailChangeSchema = z.object({
  currentEmail: z.string().trim().email(),
  newEmail: z.string().trim().email(),
});

export const verifyEmailChangeSchema = z.object({
  newEmail: z.string().trim().email(),
  code: z.string().min(4).max(8),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateAccountPreferencesInput = z.infer<
  typeof updateAccountPreferencesSchema
>;
export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;
export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema>;
export type VerifyEmailChangeInput = z.infer<typeof verifyEmailChangeSchema>;
