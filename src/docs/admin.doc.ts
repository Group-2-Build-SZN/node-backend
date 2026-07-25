import { registry } from "@/lib/open-api-registry";
import {
  updatePropertyStatusSchema,
  resolveKycSchema,
  blacklistUserSchema,
  updateReportStatusSchema,
} from "@/validations/admin.validation";
import { z } from "@/lib/zod";

registry.registerPath({
  method: "get",
  path: "/admin/reports",
  summary:
    "List all property reports, optionally filtered by status (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      propertyId: z.string().uuid().optional(),
      status: z
        .enum(["open", "under_review", "resolved", "dismissed"])
        .optional(),
    }),
  },
  responses: {
    200: { description: "List of reports" },
    403: { description: "Not an admin" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/admin/reports/{id}/status",
  summary: "Update a report's moderation status (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: updateReportStatusSchema } },
    },
  },
  responses: {
    200: { description: "Report status updated" },
    404: { description: "Report not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/admin/properties/{id}/status",
  summary: "Manually set a property's availability status (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: updatePropertyStatusSchema } },
    },
  },
  responses: { 200: { description: "Status updated" } },
});

registry.registerPath({
  method: "get",
  path: "/admin/kyc/review-needed",
  summary: "List KYC verifications stuck in review_needed (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "List of pending reviews" } },
});

registry.registerPath({
  method: "patch",
  path: "/admin/kyc/{id}/resolve",
  summary:
    "Manually resolve a KYC verification to verified/rejected (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: resolveKycSchema } } },
  },
  responses: { 200: { description: "Verification resolved" } },
});

registry.registerPath({
  method: "patch",
  path: "/admin/users/{id}/blacklist",
  summary:
    "Set a user's blacklist status (admin only) — revokes all active sessions and unpublishes all their listings when blacklisting",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: blacklistUserSchema } } },
  },
  responses: { 200: { description: "Blacklist status updated" } },
});
