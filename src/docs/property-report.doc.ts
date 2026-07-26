import { registry } from "@/lib/open-api-registry";
import { submitReportSchema } from "@/validations/property-report.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "post",
  path: "/properties/{id}/report",
  summary:
    "Report a property (reason, optional description, optional evidence — multipart/form-data)",
  tags: ["Property Reports"],
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
        "multipart/form-data": {
          schema: submitReportSchema.extend({
            evidence: z
              .array(z.string())
              .optional()
              .openapi({
                description: "Up to 5 image/video files",
                type: "string",
                format: "binary",
              } as any),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description:
        "Report submitted with a reference ID (e.g. MU-2026-07-26-88741)",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "7875dda2-9e09-46cd-a7c9-9829225f2dd8",
            referenceId: "MU-2026-07-26-88741",
            propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
            reporterId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            reason: "other",
            description: "string",
            evidenceUrls: [
              "https://res.cloudinary.com/l7bjl5ep/image/upload/v1785020731/ulo/reports/evidence/ff5ebfoopvyfxmqheoty.jpg",
            ],
            status: "open",
            createdAt: "2026-07-26T00:05:31.688Z",
          },
        }),
      },
    },
    400: {
      description: "Validation error or invalid multipart form body",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Validation error",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
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
