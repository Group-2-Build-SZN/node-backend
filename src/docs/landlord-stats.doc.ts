import { registry } from "@/lib/open-api-registry";
import { getRecentInquiriesQuerySchema } from "@/validations/landlord-stats.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/landlord/stats",
  summary:
    "Get landlord dashboard stats — property counts, view totals, recent search hits, and top performing property",
  tags: ["Landlord Stats"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Landlord statistics retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            totalProperties: 12,
            activeListings: 8,
            totalViews: 150,
            recentSearches: 18,
            topPerformingProperty: {
              id: "597d6e53-aecc-4471-89db-31db04dd5f56",
              listingTitle: "God's power lodge",
              coverImageUrl:
                "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784998701/ulo/properties/photos/myhrl0qycvox09ltzxp0.jpg",
              price: "2500000.00",
              viewCount: 87,
            },
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "get",
  path: "/landlord/inquiries/recent",
  summary:
    "Get recent inquiries received on landlord's properties — paginated list with tenant info",
  tags: ["Landlord Stats"],
  security: [{ bearerAuth: [] }],
  request: { query: getRecentInquiriesQuerySchema },
  responses: {
    200: {
      description: "Recent inquiries retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "752cf85c-ce45-405c-a0e0-928aba9c079e",
              message: "is this still available? very interested",
              status: "pending",
              createdAt: "2026-08-02T14:25:10.389Z",
              propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
              propertyTitle: "God's power lodge",
              tenantFirstName: "Chioma",
              tenantLastName: "Okafor",
              tenantAvatarUrl:
                "https://res.cloudinary.com/l7bjl5ep/image/upload/v1785000000/ulo/users/avatars/test123.jpg",
            },
            {
              id: "8a9b0c1d-2e3f-4g5h-i6j7k8l9m0n1",
              message: "can we negotiate the price?",
              status: "pending",
              createdAt: "2026-08-01T09:15:45.789Z",
              propertyId: "1a2b3c4d-5e6f-7g8h-9i0j1k2l3m4n",
              propertyTitle: "New California Lodge",
              tenantFirstName: "Tunde",
              tenantLastName: "Adeyemi",
              tenantAvatarUrl:
                "https://res.cloudinary.com/l7bjl5ep/image/upload/v1785000100/ulo/users/avatars/test456.jpg",
            },
          ],
          pagination: { page: 1, limit: 5, total: 23, totalPages: 5 },
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
