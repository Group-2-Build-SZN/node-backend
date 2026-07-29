import { registry } from "@/lib/open-api-registry";
import {
  scheduleInspectionSchema,
  updateInspectionStatusSchema,
} from "@/validations/inspection.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

const exampleInspection = {
  id: "c3e4f506-3333-4c4d-9e5f-6a7b8c9d0e1f",
  propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
  tenantId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
  agentId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
  scheduledAt: "2026-08-02T14:00:00.000Z",
  status: "pending",
  notes: "prefer weekday afternoons",
  cancellationReason: null,
  createdAt: "2026-07-25T23:55:10.389Z",
  updatedAt: "2026-07-25T23:55:10.389Z",
};

registry.registerPath({
  method: "post",
  path: "/properties/{id}/inspections",
  summary: "Schedule an inspection on a published property",
  tags: ["Inspections"],
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
          schema: scheduleInspectionSchema,
          example: {
            scheduledAt: "2026-08-02T14:00:00.000Z",
            notes: "prefer weekday afternoons",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Inspection scheduled successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: exampleInspection,
        }),
      },
    },
    400: {
      description:
        "Validation error, scheduledAt is not in the future, or the property belongs to the requesting user",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "scheduledAt must be in the future",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    404: {
      description: "Property not found or not published",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Property not found",
            code: "RESOURCE_NOT_FOUND",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/inspections/me",
  summary: "Get the current user's inspections as a tenant",
  tags: ["Inspections"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Inspections retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              inspection: exampleInspection,
              property: {
                id: "597d6e53-aecc-4471-89db-31db04dd5f56",
                listingTitle: "God's power lodge",
                address: "Hilltop UNN",
              },
            },
          ],
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "get",
  path: "/inspections/agent/me",
  summary: "Get inspections booked on the current user's properties",
  description:
    "For agents/landlords — lists inspections where they are the property owner.",
  tags: ["Inspections"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Inspections retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              inspection: exampleInspection,
              property: {
                id: "597d6e53-aecc-4471-89db-31db04dd5f56",
                listingTitle: "God's power lodge",
                address: "Hilltop UNN",
              },
            },
          ],
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/inspections/{id}/status",
  summary: "Update an inspection's status",
  description:
    "The agent/landlord who owns the property may set status to confirmed, completed, or cancelled. The tenant who booked it may only cancel.",
  tags: ["Inspections"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "c3e4f506-3333-4c4d-9e5f-6a7b8c9d0e1f" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateInspectionStatusSchema,
          example: {
            status: "cancelled",
            cancellationReason: "no longer available that day",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Inspection status updated successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            ...exampleInspection,
            status: "cancelled",
            cancellationReason: "no longer available that day",
          },
        }),
      },
    },
    400: {
      description: "Validation error in request body",
      content: {
        "application/json": jsonContent({
          success: false,
          error: { message: "Validation error", code: "INVALID_INPUT" },
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description:
        "Not a participant on this inspection, or a tenant attempting a status other than cancelled",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Tenants can only cancel an inspection",
            code: "FORBIDDEN",
          },
        }),
      },
    },
    404: {
      description: "Inspection not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Inspection not found",
            code: "RESOURCE_NOT_FOUND",
          },
        }),
      },
    },
  },
});
