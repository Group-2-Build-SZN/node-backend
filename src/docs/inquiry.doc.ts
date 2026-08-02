import { registry } from "@/lib/open-api-registry";
import { submitInquirySchema } from "@/validations/inquiry.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/inquiries",
  summary: "Get current user's inquiries — filtered by status and/or property",
  tags: ["Inquiries"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(50).optional().default(20),
      status: z.enum(["pending", "responded", "closed"]).optional(),
      propertyId: z.string().uuid().optional(),
    }),
  },
  responses: {
    200: {
      description: "Inquiries retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              inquiry: {
                id: "752cf85c-ce45-405c-a0e0-928aba9c079e",
                propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
                tenantId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
                message: "is this still available?",
                status: "responded",
                createdAt: "2026-08-02T10:30:45.123Z",
              },
              property: {
                id: "597d6e53-aecc-4471-89db-31db04dd5f56",
                listingTitle: "Luxury 3-Bedroom Apartment",
                price: "2500000.00",
              },
            },
          ],
          pagination: { page: 1, limit: 20, total: 12 },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "post",
  path: "/properties/{id}/inquiries",
  summary: "Submit an inquiry about a property",
  tags: ["Inquiries"],
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
          schema: submitInquirySchema,
          example: {
            message: "is this still available?",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Inquiry submitted successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "752cf85c-ce45-405c-a0e0-928aba9c079e",
            propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
            tenantId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            message: "is this still available?",
            status: "pending",
            createdAt: "2026-07-25T23:55:10.389Z",
          },
        }),
      },
    },
    400: {
      description: "Validation error in request body",
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

registry.registerPath({
  method: "get",
  path: "/inquiries",
  summary: "Get the current user's submitted inquiries",
  tags: ["Inquiries"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description:
        "List of inquiries with property details retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              inquiry: {
                id: "752cf85c-ce45-405c-a0e0-928aba9c079e",
                propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
                tenantId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
                message: "is this still available?",
                status: "pending",
                createdAt: "2026-07-25T23:55:10.389Z",
              },
              property: {
                id: "597d6e53-aecc-4471-89db-31db04dd5f56",
                ownerId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
                listingTitle: "God's power lodge",
                listingPurpose: "rent",
                description: "a self con with kitchen and toilet",
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
                flagCount: 0,
                availabilityStatus: "available",
                isPublished: true,
                createdAt: "2026-07-25T16:30:00.276Z",
                updatedAt: "2026-07-25T17:29:38.893Z",
              },
            },
          ],
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});
