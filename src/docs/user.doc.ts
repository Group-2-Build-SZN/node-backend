import { registry } from "@/lib/open-api-registry";
import { z } from "@/lib/zod";

registry.registerPath({
  method: "get",
  path: "/users/me",
  summary: "Get the current user's full profile",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Current user's profile" } },
});

registry.registerPath({
  method: "get",
  path: "/users/me/stats",
  summary:
    "Get the current user's account overview stats (saved, viewed, inquiries)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "{ savedProperties, viewedProperties, inquiriesMade }",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/users/me/avatar",
  summary: "Upload/update profile avatar (multipart/form-data)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            avatar: z
              .string()
              .openapi({ type: "string", format: "binary" } as any),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "Avatar updated" } },
});

registry.registerPath({
  method: "delete",
  path: "/users/me",
  summary:
    "Permanently delete the current user's account and all associated data",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Account deleted" } },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}/profile",
  summary: "Get a public agent/landlord profile",
  tags: ["Users"],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "Public profile with published listings" },
    404: { description: "Not found" },
  },
});
