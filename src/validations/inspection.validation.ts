import { z } from "@/lib/zod";

export const scheduleInspectionSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({ message: "scheduledAt must be an ISO 8601 datetime" })
    .refine((val) => new Date(val) > new Date(), {
      message: "scheduledAt must be in the future",
    }),
  notes: z.string().trim().max(500).optional(),
});

export const updateInspectionStatusSchema = z.object({
  status: z.enum(["confirmed", "completed", "cancelled"]),
  cancellationReason: z.string().trim().max(300).optional(),
});

export type ScheduleInspectionInput = z.infer<typeof scheduleInspectionSchema>;
export type UpdateInspectionStatusInput = z.infer<
  typeof updateInspectionStatusSchema
>;
