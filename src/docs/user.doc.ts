import { registry } from "@/lib/open-api-registry";
import {
  updateProfileSchema,
  updateAccountPreferencesSchema,
  updateNotificationPreferencesSchema,
  requestEmailChangeSchema,
  verifyEmailChangeSchema,
} from "@/validations/user.validation";
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
  method: "get",
  path: "/users/me/activity",
  summary: "Get the current user's unified activity feed",
  description:
    "Merges viewed, saved, and reviewed property events into one chronological, paginated feed for the dashboard.",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    }),
  },
  responses: {
    200: {
      description: "Activity feed retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              type: "viewed",
              propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
              listingTitle: "God's power lodge",
              photoUrls: [
                "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784998701/ulo/properties/photos/myhrl0qycvox09ltzxp0.jpg",
              ],
              occurredAt: "2026-07-25T23:55:10.389Z",
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
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

const exampleUser = {
  id: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
  firstName: "John",
  lastName: "Adamu",
  email: "tenant1@gmail.com",
  phone: "08011111111",
  role: "tenant",
  dateOfBirth: "1990-01-01",
  gender: "male",
  city: "Nsukka",
  country: "Nigeria",
  language: "en",
  timezone: "Africa/Lagos",
  dateFormat: "DD/MM/YYYY",
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
};

registry.registerPath({
  method: "patch",
  path: "/users/me/profile",
  summary: "Update extra profile fields (Settings > Profile)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateProfileSchema,
          example: {
            firstName: "John",
            lastName: "Adamu",
            dateOfBirth: "1990-01-01",
            gender: "male",
            city: "Nsukka",
            country: "Nigeria",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Profile updated successfully",
      content: {
        "application/json": jsonContent({ success: true, data: exampleUser }),
      },
    },
    400: {
      description:
        "Validation error, e.g. dateOfBirth is not in YYYY-MM-DD format or is in the future",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "dateOfBirth must be in the past",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/users/me/account",
  summary:
    "Update account preferences — language, timezone, date format (Settings > Account)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateAccountPreferencesSchema,
          example: {
            language: "en",
            timezone: "Africa/Lagos",
            dateFormat: "DD/MM/YYYY",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Account preferences updated successfully",
      content: {
        "application/json": jsonContent({ success: true, data: exampleUser }),
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
  },
});

const exampleNotificationPreferences = [
  { category: "new_inquiries", emailEnabled: true, pushEnabled: true },
  { category: "messages", emailEnabled: true, pushEnabled: true },
  { category: "inspection_updates", emailEnabled: true, pushEnabled: true },
  { category: "price_drops", emailEnabled: false, pushEnabled: true },
  {
    category: "saved_property_updates",
    emailEnabled: true,
    pushEnabled: true,
  },
  { category: "account_activity", emailEnabled: true, pushEnabled: true },
  { category: "promotions", emailEnabled: false, pushEnabled: false },
];

registry.registerPath({
  method: "get",
  path: "/users/me/notification-preferences",
  summary:
    "Get notification preferences for every category (Settings > Notifications)",
  description:
    "Any category the user has never touched is returned with the default of email+push both enabled, so this always returns the full list of categories.",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Notification preferences retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: exampleNotificationPreferences,
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/users/me/notification-preferences",
  summary: "Update notification preferences for one or more categories",
  description:
    "Only the categories included in the request body are changed; other categories are left as-is. Returns the full updated list.",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateNotificationPreferencesSchema,
          example: {
            preferences: [
              { category: "price_drops", emailEnabled: false },
              {
                category: "promotions",
                emailEnabled: false,
                pushEnabled: false,
              },
            ],
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Notification preferences updated successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: exampleNotificationPreferences,
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
  },
});

registry.registerPath({
  method: "post",
  path: "/users/me/email/request-change",
  summary: "Request an email change — step 1 of 2 (Settings > Security)",
  description:
    "Verifies the caller knows their current email and that the new email isn't already taken, then sends a one-time code to the new address.",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: requestEmailChangeSchema,
          example: {
            currentEmail: "tenant1@gmail.com",
            newEmail: "tenant1-new@gmail.com",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Verification code sent to the new email address",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            message: "Verification code sent to your new email address",
          },
        }),
      },
    },
    400: {
      description:
        "currentEmail doesn't match the account, or newEmail is the same as the current email",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Current email does not match your account",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    409: {
      description: "newEmail is already in use by another account",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Email address is already in use",
            code: "DUPLICATE_ENTRY",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/users/me/email/verify-change",
  summary:
    "Verify the emailed code and finalize the email change — step 2 of 2",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: verifyEmailChangeSchema,
          example: { newEmail: "tenant1-new@gmail.com", code: "482913" },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Email changed successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: { ...exampleUser, email: "tenant1-new@gmail.com" },
        }),
      },
    },
    400: {
      description: "Code is invalid, or expired/not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Invalid code",
            code: "INVALID_EXPIRED_TOKEN",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    409: {
      description:
        "newEmail was taken by another account after the request was made",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Email address is already in use",
            code: "DUPLICATE_ENTRY",
          },
        }),
      },
    },
  },
});

const exampleRecentSearch = {
  id: "d4e5f607-4444-4d5e-9f60-7a8b9c0d1e2f",
  userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
  query: "2 bedroom flat nsukka",
  filters: { propertyType: "flat", bedrooms: 2, city: "Nsukka" },
  createdAt: "2026-07-25T23:55:10.389Z",
};

registry.registerPath({
  method: "post",
  path: "/users/me/recent-searches",
  summary: "Record a search (dashboard stat)",
  description:
    "Stores up to 50 recent searches per user; the oldest are trimmed once the cap is exceeded.",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: recordSearchSchema,
          example: {
            query: "2 bedroom flat nsukka",
            filters: { propertyType: "flat", bedrooms: 2, city: "Nsukka" },
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
          data: exampleRecentSearch,
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
  },
});

registry.registerPath({
  method: "get",
  path: "/users/me/recent-searches",
  summary: "Get recent searches, most recent first",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: { query: getRecentSearchesQuerySchema },
  responses: {
    200: {
      description: "Recent searches retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [exampleRecentSearch],
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/users/me/recent-searches",
  summary: "Clear all recent searches for the current user",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Recent searches cleared",
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
