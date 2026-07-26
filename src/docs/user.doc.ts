import { registry } from "@/lib/open-api-registry";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/users/me",
  summary: "Get the current user's full profile",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current user's profile retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            firstName: "John",
            lastName: "Adamu",
            email: "tenant1@gmail.com",
            phone: "08011111111",
            role: "tenant",
            googleId: null,
            avatarUrl: null,
            referralCode: "ULO65F89C",
            subscriptionCode: "SUB_gfy15jl6feiwmso",
            subscriptionEmailToken: "1qqk88hwt74ay8g",
            isPremium: true,
            premiumUntil: "2026-08-24T23:12:10.262Z",
            isBlacklisted: false,
            createdAt: "2026-07-25T18:39:36.636Z",
            updatedAt: "2026-07-25T23:12:10.262Z",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
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
      description: "User account stats retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            savedProperties: 1,
            viewedProperties: 1,
            inquiriesMade: 1,
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
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
  responses: {
    200: {
      description: "Avatar updated successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            firstName: "John",
            lastName: "Adamu",
            email: "tenant1@gmail.com",
            phone: "08011111111",
            role: "tenant",
            googleId: null,
            avatarUrl:
              "https://res.cloudinary.com/l7bjl5ep/image/upload/v1785022824/ulo/avatars/ihycafzkki6kk8nfqbme.jpg",
            referralCode: "ULO65F89C",
            subscriptionCode: "SUB_gfy15jl6feiwmso",
            subscriptionEmailToken: "1qqk88hwt74ay8g",
            isPremium: true,
            premiumUntil: "2026-08-24T23:12:10.262Z",
            isBlacklisted: false,
            createdAt: "2026-07-25T18:39:36.636Z",
            updatedAt: "2026-07-25T23:40:26.516Z",
          },
        }),
      },
    },
    400: {
      description: "Invalid image file or missing file in form payload",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Avatar file is required",
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
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "5311b044-ebda-4fb9-9f6d-470be0bb37fd" }),
    }),
  },
  responses: {
    200: {
      description:
        "Public profile with published listings retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            firstName: "John",
            lastName: "Adamu",
            role: "tenant",
            memberSince: "2026-07-25T18:39:36.636Z",
            isVerified: true,
            listingCount: 0,
            listings: [],
          },
        }),
      },
    },
    404: {
      description: "User profile not found",
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
