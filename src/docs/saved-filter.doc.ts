import { registry } from "@/lib/open-api-registry";
import { createSavedFilterSchema } from "@/validations/saved-filter.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/saved-filters",
  summary: "List the current user's saved filter presets",
  tags: ["Saved Filters"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of saved filters retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "30891d93-3da5-4d07-877a-5eeef57486ff",
              userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
              name: "My Search",
              filters: {
                key_0: "haven",
                key_1: "",
                key_2: "",
              },
              createdAt: "2026-07-25T23:29:21.802Z",
            },
          ],
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "post",
  path: "/saved-filters",
  summary: "Save a named filter preset",
  tags: ["Saved Filters"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createSavedFilterSchema,
          example: {
            name: "My Search",
            filters: {
              key_0: "haven",
              key_1: "",
              key_2: "",
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Filter saved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "30891d93-3da5-4d07-877a-5eeef57486ff",
            userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            name: "My Search",
            filters: {
              key_0: "haven",
              key_1: "",
              key_2: "",
            },
            createdAt: "2026-07-25T23:29:21.802Z",
          },
        }),
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Invalid filter data",
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
  path: "/saved-filters/{id}",
  summary: "Delete a saved filter preset",
  tags: ["Saved Filters"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "Deleted" },
    404: { description: "Not found" },
  },
});
