import { registry } from "@/lib/open-api-registry";
import {
  updatePropertyStatusSchema,
  resolveKycSchema,
  blacklistUserSchema,
} from "@/validations/admin.validation";

registry.registerPath({
  method: "get",
  path: "/admin/reports",
  summary: "List all property reports (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "List of reports" },
    403: { description: "Not an admin" },
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
    "Set a user's blacklist status (admin only) \u2014 revokes all active sessions when blacklisting",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: blacklistUserSchema } } },
  },
  responses: { 200: { description: "Blacklist status updated" } },
});
