import { registry } from "@/lib/open-api-registry";
import { createSavedFilterSchema } from "@/validations/saved-filter.validation";
import { z } from "@/lib/zod";

registry.registerPath({
  method: "get",
  path: "/saved-filters",
  summary: "List the current user's saved filter presets",
  tags: ["Saved Filters"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "List of saved filters" } },
});

registry.registerPath({
  method: "post",
  path: "/saved-filters",
  summary: "Save a named filter preset",
  tags: ["Saved Filters"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createSavedFilterSchema } },
    },
  },
  responses: { 201: { description: "Filter saved" } },
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
