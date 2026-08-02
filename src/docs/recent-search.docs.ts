import { registry } from "@/lib/open-api-registry";
import {
  recordSearchSchema,
  getRecentSearchesQuerySchema,
} from "@/validations/recent-search.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "post",
  path: "/users/me/recent-searches",
  summary: "Record a property search — stores query and filters for the user",
  tags: ["Recent Searches"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: recordSearchSchema,
          example: {
            query: "2 bedroom flat nsukka",
            filters: {
              minPrice: 500000,
              maxPrice: 2000000,
              bedrooms: 2,
              propertyType: "apartment",
              location: "nsukka",
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Search recorded successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "d4c5f8a2-1b3e-4f7a-9c2d-8e1f5a3b7c9d",
            userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            query: "2 bedroom flat nsukka",
            filters: {
              minPrice: 500000,
              maxPrice: 2000000,
              bedrooms: 2,
              propertyType: "flat",
              location: "nsukka",
            },
            createdAt: "2026-08-02T10:30:45.123Z",
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
  },
});

registry.registerPath({
  method: "get",
  path: "/users/me/recent-searches",
  summary:
    "Get recent searches — retrieves user's search history (default limit: 10, max: 50)",
  tags: ["Recent Searches"],
  security: [{ bearerAuth: [] }],
  request: { query: getRecentSearchesQuerySchema },
  responses: {
    200: {
      description: "Recent searches retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "d4c5f8a2-1b3e-4f7a-9c2d-8e1f5a3b7c9d",
              userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
              query: "2 bedroom flat nsukka",
              filters: {
                minPrice: 500000,
                maxPrice: 2000000,
                bedrooms: 2,
                propertyType: "flat",
              },
              createdAt: "2026-08-02T10:30:45.123Z",
            },
            {
              id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
              userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
              query: "2 bedroom flat nsukka",
              filters: {
                maxPrice: 800000,
                propertyType: "flat",
              },
              createdAt: "2026-08-01T15:20:30.456Z",
            },
          ],
        }),
      },
    },
    400: {
      description: "Invalid query parameters",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Invalid query parameters",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/users/me/recent-searches",
  summary: "Clear recent searches — removes all search history for the user",
  tags: ["Recent Searches"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Recent searches cleared successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          message: "Recent searches cleared",
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});
