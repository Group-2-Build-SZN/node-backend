import { z } from "@/lib/zod";
import { registry } from "@/lib/open-api-registry";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesQuerySchema,
  propertyIdSchema,
} from "@/validations/property.validation";

registry.registerPath({
  method: "get",
  path: "/properties",
  summary:
    "List/search properties with filters, pagination, and optional proximity search",
  tags: ["Properties"],
  request: { query: getPropertiesQuerySchema },
  responses: { 200: { description: "Paginated list of properties" } },
});

registry.registerPath({
  method: "get",
  path: "/properties/recommended",
  summary: "Get recommended properties (ranked by trust score)",
  tags: ["Properties"],
  responses: { 200: { description: "List of recommended properties" } },
});

registry.registerPath({
  method: "get",
  path: "/properties/{id}",
  summary:
    "Get a single property — includes Trek Check, trust score, owner info, isSaved",
  tags: ["Properties"],
  request: { params: propertyIdSchema },
  responses: {
    200: { description: "Property details" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/properties",
  summary: "Create a property (agent/landlord only)",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createPropertySchema } } },
  },
  responses: {
    201: { description: "Property created" },
    401: { description: "Not authenticated" },
    403: { description: "Not an agent/landlord" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/properties/{id}",
  summary: "Update a property (owner only)",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: {
    params: propertyIdSchema,
    body: { content: { "application/json": { schema: updatePropertySchema } } },
  },
  responses: {
    200: { description: "Property updated" },
    404: { description: "Not found or not owned by you" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/properties/{id}/publish",
  summary: "Publish a property listing — requires owner's KYC to be verified",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: { params: propertyIdSchema },
  responses: {
    200: { description: "Property published" },
    403: { description: "Owner not KYC-verified" },
    404: { description: "Not found or not owned by you" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/properties/{id}",
  summary: "Delete a property (owner only)",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: { params: propertyIdSchema },
  responses: {
    200: { description: "Property deleted" },
    404: { description: "Not found or not owned by you" },
  },
});

registry.registerPath({
  method: "post",
  path: "/properties/{id}/media",
  summary: "Upload photos/videos for a property (multipart/form-data)",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: {
    params: propertyIdSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            photos: z.array(z.string()).openapi({
              description: "Up to 10 image files",
              type: "string",
              format: "binary",
            } as any),
            videos: z.array(z.string()).openapi({
              description: "Up to 3 video files",
              type: "string",
              format: "binary",
            } as any),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "Media uploaded, URLs appended to property" },
  },
});

registry.registerPath({
  method: "post",
  path: "/properties/{id}/save",
  summary: "Save a property to favorites",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: { params: propertyIdSchema },
  responses: {
    201: { description: "Property saved" },
    409: { description: "Already saved" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/properties/{id}/save",
  summary: "Remove a property from favorites",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: { params: propertyIdSchema },
  responses: {
    200: { description: "Removed" },
    404: { description: "Not saved" },
  },
});
