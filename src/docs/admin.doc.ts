import { registry } from "@/lib/open-api-registry";
import {
  updatePropertyStatusSchema,
  resolveKycSchema,
  blacklistUserSchema,
  updateReportStatusSchema,
} from "@/validations/admin.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/admin/reports",
  summary:
    "List all property reports, optionally filtered by status (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      propertyId: z
        .string()
        .uuid()
        .optional()
        .openapi({ example: "597d6e53-aecc-4471-89db-31db04dd5f56" }),
      status: z
        .enum(["open", "under_review", "resolved", "dismissed"])
        .optional()
        .openapi({ example: "open" }),
    }),
  },
  responses: {
    200: {
      description: "List of reports retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "7875dda2-9e09-46cd-a7c9-9829225f2dd8",
              referenceId: "MU-2026-07-26-88741",
              propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
              reporterId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
              reason: "other",
              description: "fake listing",
              evidenceUrls: [
                "https://res.cloudinary.com/l7bjl5ep/image/upload/v1785020731/ulo/reports/evidence/ff5ebfoopvyfxmqheoty.jpg",
              ],
              status: "open",
              createdAt: "2026-07-26T00:05:31.688Z",
            },
            {
              id: "73a35e32-e15f-40f8-9acb-4fce4ece7da6",
              referenceId: "MU-2026-07-17-62799",
              propertyId: "6d04d5a8-0de4-43ed-ae3d-cf09e31535e4",
              reporterId: "11111111-1111-1111-1111-111111111111",
              reason: "fake_listing",
              description: "This property does not appear to exist",
              evidenceUrls: [
                "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784289376/ulo/reports/evidence/dvlceurgpblqxsfpkczh.jpg",
              ],
              status: "open",
              createdAt: "2026-07-17T12:56:16.796Z",
            },
          ],
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "Forbidden — Requires administrative privileges",
      content: {
        "application/json": jsonContent({
          success: false,
          message: "Forbidden",
        }),
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/admin/reports/{id}/status",
  summary: "Update a report's moderation status (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "73a35e32-e15f-40f8-9acb-4fce4ece7da6" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateReportStatusSchema,
          example: {
            status: "resolved",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Report status updated successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "73a35e32-e15f-40f8-9acb-4fce4ece7da6",
            referenceId: "MU-2026-07-17-62799",
            propertyId: "6d04d5a8-0de4-43ed-ae3d-cf09e31535e4",
            reporterId: "11111111-1111-1111-1111-111111111111",
            reason: "fake_listing",
            description: "This property does not appear to exist",
            evidenceUrls: [
              "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784289376/ulo/reports/evidence/dvlceurgpblqxsfpkczh.jpg",
            ],
            status: "resolved",
            createdAt: "2026-07-17T12:56:16.796Z",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "Forbidden — Requires administrative privileges",
      content: {
        "application/json": jsonContent({
          success: false,
          message: "Forbidden",
        }),
      },
    },
    404: {
      description: "Report not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Report not found",
            code: "NOT_FOUND",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/admin/properties/{id}/status",
  summary: "Manually set a property's availability status (admin only)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "597d6e53-aecc-4471-89db-31db04dd5f56" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updatePropertyStatusSchema,
          example: {
            availabilityStatus: "available",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Property availability status updated successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "597d6e53-aecc-4471-89db-31db04dd5f56",
            ownerId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
            listingTitle: "God's power lodge",
            listingPurpose: "rent",
            description: "a self con wth kitchen and toilet",
            propertyType: "self_contained",
            bedrooms: 0,
            bathrooms: 1,
            price: "350000.00",
            address: "Hilltop UNN",
            location: {
              x: 0,
              y: 0,
            },
            videoUrls: [
              "http://ivv.bmcgWcJ3gL+MOplWG44ZAaHC2ulV9egicgMag2HqmFCzf6mn1YmXJsIF02jQWLyfNi9e0RgdOk0",
              "https://yWNQFolWAKMClQAedezIxCs.yrbrfA-Umd7HwG",
            ],
            photoUrls: [
              "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784998701/ulo/properties/photos/myhrl0qycvox09ltzxp0.jpg",
            ],
            features: ["parking", "security"],
            flagCount: 1,
            availabilityStatus: "available",
            isPublished: true,
            createdAt: "2026-07-25T16:30:00.276Z",
            updatedAt: "2026-07-26T01:17:24.306Z",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "Forbidden — Requires administrative privileges",
      content: {
        "application/json": jsonContent({
          success: false,
          message: "Forbidden",
        }),
      },
    },
    404: {
      description: "Property not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Property not found",
            code: "NOT_FOUND",
          },
        }),
      },
    },
  },
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
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "7be4fa93-8d56-4bc2-88c5-e95346830679" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: blacklistUserSchema,
          example: {
            blacklisted: true,
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "User blacklist status updated successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "7be4fa93-8d56-4bc2-88c5-e95346830679",
            firstName: "Jason",
            lastName: "Kabiru",
            email: "tenant@gmail.com",
            phone: "08022222222",
            role: "agent",
            googleId: null,
            avatarUrl: null,
            referralCode: null,
            subscriptionCode: null,
            subscriptionEmailToken: null,
            isPremium: false,
            premiumUntil: null,
            isBlacklisted: true,
            createdAt: "2026-07-25T15:17:06.926Z",
            updatedAt: "2026-07-26T01:22:19.611Z",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "Forbidden — Requires administrative privileges",
      content: {
        "application/json": jsonContent({
          success: false,
          message: "Forbidden",
        }),
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "User not found",
            code: "NOT_FOUND",
          },
        }),
      },
    },
  },
});
