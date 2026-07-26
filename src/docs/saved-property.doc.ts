import { registry } from "@/lib/open-api-registry";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/saved",
  summary:
    "List the current user's saved properties, optionally filtered by rent/sale",
  tags: ["Saved"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      listingPurpose: z.enum(["rent", "sale"]).optional(),
    }),
  },
  responses: {
    200: {
      description: "List of saved properties",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              savedAt: "2026-07-25T23:18:18.270Z",
              property: {
                id: "597d6e53-aecc-4471-89db-31db04dd5f56",
                ownerId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
                listingTitle: "God's power lodge",
                listingPurpose: "rent",
                description: "a self con wth kitchen and toilet",
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
                features: ["string", "string"],
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

registry.registerPath({
  method: "get",
  path: "/saved/counts",
  summary: "Get saved property counts by listing purpose (all/rent/sale)",
  tags: ["Saved"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Counts of saved properties categorized by purpose",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            all: 1,
            forRent: 1,
            forSale: 0,
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});
