import { z } from "@/lib/zod";
import { registry } from "@/lib/open-api-registry";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesQuerySchema,
  propertyIdSchema,
} from "@/validations/property.validation";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/properties",
  summary:
    "List/search properties with filters, pagination, and optional proximity search",
  tags: ["Properties"],
  request: { query: getPropertiesQuerySchema },
  responses: {
    200: {
      description: "Paginated list of properties retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "597d6e53-aecc-4471-89db-31db04dd5f56",
              owner_id: "7be4fa93-8d56-4bc2-88c5-e95346830679",
              listing_title: "God's power lodge",
              description: "a self con wth kitchen and toilet",
              property_type: "self_contained",
              bedrooms: 0,
              bathrooms: 1,
              price: "350000.00",
              address: "Hilltop UNN",
              location: "0101000020E610000000000000000000000000000000000000",
              video_urls: [
                "https://res.cloudinary.com/l7bjl5ep/video/upload/v1784998719/ulo/properties/videos/jx1mgmww5zbykzqzyn0m.mp4",
              ],
              flag_count: 0,
              availability_status: "available",
              is_published: true,
              created_at: "2026-07-25 16:30:00.276303",
              updated_at: "2026-07-25 17:29:38.893",
              features: ["water", "security"],
              photo_urls: [
                "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784998701/ulo/properties/photos/myhrl0qycvox09ltzxp0.jpg",
              ],
              listing_purpose: "rent",
              water_score: "0",
              power_score: "0",
              security_score: "0",
              trust_score: "0",
              is_saved: false,
            },
            {
              id: "324f602a-f0fb-436c-b5de-e2dcd1cbb975",
              owner_id: "a9e458cf-b432-4d79-8bfc-ded3883e5f32",
              listing_title: "New California Lodge",
              description: "modern apartment with constant power supply",
              property_type: "one_bedroom_flat",
              bedrooms: 1,
              bathrooms: 1,
              price: "500000.00",
              address: "Hilltop, Unn",
              location: "0101000020E6100000501C7E33F7B229409A455CEB34FA5240",
              video_urls: [],
              flag_count: 0,
              availability_status: "available",
              is_published: true,
              created_at: "2026-07-21 20:04:29.666705",
              updated_at: "2026-07-21 19:08:06.037",
              features: ["parking", "wifi"],
              photo_urls: null,
              listing_purpose: "rent",
              water_score: "0",
              power_score: "0",
              security_score: "0",
              trust_score: "0",
              is_saved: false,
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 3,
            totalPages: 1,
          },
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
  },
});

registry.registerPath({
  method: "get",
  path: "/properties/recommended",
  summary: "Get recommended properties (ranked by trust score)",
  tags: ["Properties"],
  responses: {
    200: {
      description: "List of recommended properties retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "597d6e53-aecc-4471-89db-31db04dd5f56",
              owner_id: "7be4fa93-8d56-4bc2-88c5-e95346830679",
              listing_title: "God's power lodge",
              description: "a self con wth kitchen and toilet",
              property_type: "self_contained",
              bedrooms: 0,
              bathrooms: 1,
              price: "350000.00",
              address: "Hilltop UNN",
              location: "0101000020E610000000000000000000000000000000000000",
              video_urls: [
                "http://ivv.bmcgWcJ3gL+MOplWG44ZAaHC2ulV9egicgMag2HqmFCzf6mn1YmXJsIF02jQWLyfNi9e0RgdOk0",
                "https://yWNQFolWAKMClQAedezIxCs.yrbrfA-Umd7HwG",
              ],
              flag_count: 0,
              availability_status: "available",
              is_published: true,
              created_at: "2026-07-25 16:30:00.276303",
              updated_at: "2026-07-25 17:29:38.893",
              features: ["water", "security"],
              photo_urls: [
                "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784998701/ulo/properties/photos/myhrl0qycvox09ltzxp0.jpg",
              ],
              listing_purpose: "rent",
              trust_score: "0",
            },
            {
              id: "324f602a-f0fb-436c-b5de-e2dcd1cbb975",
              owner_id: "a9e458cf-b432-4d79-8bfc-ded3883e5f32",
              listing_title: "New California Lodge",
              description: "modern apartment with constant power supply",
              property_type: "one_bedroom_flat",
              bedrooms: 1,
              bathrooms: 1,
              price: "500000.00",
              address: "Hilltop, Unn",
              location: "0101000020E6100000501C7E33F7B229409A455CEB34FA5240",
              video_urls: [],
              flag_count: 0,
              availability_status: "available",
              is_published: true,
              created_at: "2026-07-21 20:04:29.666705",
              updated_at: "2026-07-21 19:08:06.037",
              features: ["parking", "wifi"],
              photo_urls: null,
              listing_purpose: "rent",
              trust_score: "0",
            },
            {
              id: "6d04d5a8-0de4-43ed-ae3d-cf09e31535e4",
              owner_id: "11111111-1111-1111-1111-111111111111",
              listing_title: "2 Bedroom Apartment, New Haven",
              description:
                "Spacious and fully serviced 2 bedroom apartment in a secure estate.",
              property_type: "two_bedroom_flat",
              bedrooms: 2,
              bathrooms: 2,
              price: "1500000.00",
              address: "New Haven, Enugu",
              location: "0101000020E61000008FC2F5285C0F1E40F2D24D6210D81940",
              video_urls: null,
              flag_count: 1,
              availability_status: "available",
              is_published: true,
              created_at: "2026-07-17 12:28:19.800375",
              updated_at: "2026-07-17 11:56:16.837",
              features: ["parking", "generator", "water_supply", "security"],
              photo_urls: null,
              listing_purpose: "rent",
              trust_score: "0",
            },
          ],
        }),
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/properties/{id}",
  summary:
    "Get a single property — includes Trek Check, trust summary, owner info, and isSaved flag",
  tags: ["Properties"],
  request: { params: propertyIdSchema },
  responses: {
    200: {
      description: "Property details retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            isSaved: false,
            id: "597d6e53-aecc-4471-89db-31db04dd5f56",
            ownerId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
            listingTitle: "God's power lodge",
            listingPurpose: "rent",
            description: "a self con wth kitchen and toilet",
            propertyType: "self_contained",
            bedrooms: 0,
            bathrooms: 1,
            price: "300000.00",
            address: "Hilltop UNN",
            location: {
              x: 0,
              y: 0,
            },
            videoUrls: [
              "http://ivv.bmcgWcJ3gL+MOplWG44ZAaHC2ulV9egicgMag2HqmFCzf6mn1YmXJsIF02jQWLyfNi9e0RgdOk0",
              "https://yWNQFolWAKMClQAedezIxCs.yrbrfA-Umd7HwG",
              "https://res.cloudinary.com/l7bjl5ep/video/upload/v1784998719/ulo/properties/videos/jx1mgmww5zbykzqzyn0m.mp4",
            ],
            photoUrls: [
              "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784998701/ulo/properties/photos/myhrl0qycvox09ltzxp0.jpg",
            ],
            features: ["string", "string"],
            flagCount: 0,
            availabilityStatus: "available",
            isPublished: true,
            createdAt: "2026-07-25T16:30:00.276Z",
            updatedAt: "2026-07-25T17:05:42.204Z",
            trekCheck: [
              {
                type: "filling_station",
                name: "Total Filling Station, New Haven",
                distance_metres: 1098938,
              },
              {
                type: "market",
                name: "New Haven Market",
                distance_metres: 1098953,
              },
              {
                type: "hospital",
                name: "ESUT Teaching Hospital",
                distance_metres: 1097272,
              },
              {
                type: "school",
                name: "Command Secondary School",
                distance_metres: 1098606,
              },
              {
                type: "town_center",
                name: "New Haven Roundabout",
                distance_metres: 1098708,
              },
            ],
            trustSummary: {
              review_count: "0",
              water_rating: "0",
              electricity_rating: "0",
              security_rating: "0",
              road_accessiblity_rating: "0",
              cleanliness_rating: "0",
              trust_score: "0",
            },
            owner: {
              id: "7be4fa93-8d56-4bc2-88c5-e95346830679",
              firstName: "Jason",
              memberSince: "2026-07-25 15:17:06.926028",
              isVerified: true,
              contact: null,
            },
          },
        }),
      },
    },
    404: {
      description: "Property not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Property not found",
            code: "NOT_FOUND",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/properties",
  summary: "Create a property (agent/landlord only)",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createPropertySchema,
          example: {
            listingTitle: "God's power lodge",
            propertyType: "self_contained",
            price: 300000,
            address: "Hilltop UNN",
            latitude: null,
            longitude: null,
            listingPurpose: "rent",
            description: "a self con wth kitchen and toilet",
            bedrooms: 0,
            bathrooms: 1,
            videoUrls: [
              "http://ivv.bmcgWcJ3gL+MOplWG44ZAaHC2ulV9egicgMag2HqmFCzf6mn1YmXJsIF02jQWLyfNi9e0RgdOk0",
              "https://yWNQFolWAKMClQAedezIxCs.yrbrfA-Umd7HwG",
            ],
            features: ["string", "string"],
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Property created",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "597d6e53-aecc-4471-89db-31db04dd5f56",
            ownerId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
            listingTitle: "God's power lodge",
            listingPurpose: "rent",
            description: "a self con wth kitchen and toilet",
            propertyType: "self_contained",
            bedrooms: 0,
            bathrooms: 1,
            price: "300000.00",
            address: "Hilltop UNN",
            location: {
              x: 0,
              y: 0,
            },
            videoUrls: [
              "http://ivv.bmcgWcJ3gL+MOplWG44ZAaHC2ulV9egicgMag2HqmFCzf6mn1YmXJsIF02jQWLyfNi9e0RgdOk0",
              "https://yWNQFolWAKMClQAedezIxCs.yrbrfA-Umd7HwG",
            ],
            photoUrls: null,
            features: ["string", "string"],
            flagCount: 0,
            availabilityStatus: "available",
            isPublished: false,
            createdAt: "2026-07-25T16:30:00.276Z",
            updatedAt: "2026-07-25T16:30:00.276Z",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "Forbidden - user is not permitted to perform this action",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: false }),
            message: z.string().openapi({ example: "Forbidden" }),
          }),
          example: {
            success: false,
            message: "Forbidden",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/properties/{id}",
  summary: "Get single property details by ID",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "597d6e53-aecc-4471-89db-31db04dd5f56" }),
    }),
  },
  responses: {
    200: {
      description: "Property details retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            isSaved: true,
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
            flagCount: 1,
            availabilityStatus: "available",
            isPublished: true,
            createdAt: "2026-07-25T16:30:00.276Z",
            updatedAt: "2026-07-25T23:05:31.749Z",
            trekCheck: [
              {
                type: "filling_station",
                name: "Total Filling Station, New Haven",
                distance_metres: 1098938,
              },
              {
                type: "market",
                name: "New Haven Market",
                distance_metres: 1098953,
              },
              {
                type: "hospital",
                name: "ESUT Teaching Hospital",
                distance_metres: 1097272,
              },
              {
                type: "school",
                name: "Command Secondary School",
                distance_metres: 1098606,
              },
              {
                type: "town_center",
                name: "New Haven Roundabout",
                distance_metres: 1098708,
              },
            ],
            trustSummary: {
              review_count: "0",
              water_rating: "0",
              electricity_rating: "0",
              security_rating: "0",
              road_accessiblity_rating: "0",
              cleanliness_rating: "0",
              trust_score: "0",
            },
            owner: {
              id: "7be4fa93-8d56-4bc2-88c5-e95346830679",
              firstName: "Jason",
              lastName: "Kabiru",
              memberSince: true,
              contact: {
                phone: "08022222222",
                email: "tenant@gmail.com",
              },
            },
          },
        }),
      },
    },
    404: {
      description: "Property not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Property not found",
            code: "NOT_FOUND",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/properties/{id}/publish",
  summary:
    "Publish a property listing — requires owner's KYC to be verified, plus at least one photo and one video",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: { params: propertyIdSchema },
  responses: {
    200: {
      description: "Property published successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "597d6e53-aecc-4471-89db-31db04dd5f56",
            ownerId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
            listingTitle: "God's power lodge",
            listingPurpose: "rent",
            description: "a self con wth kitchen and toilet",
            propertyType: "self_contained",
            bedrooms: 0,
            bathrooms: 1,
            price: "300000.00",
            address: "Hilltop UNN",
            location: {
              x: 0,
              y: 0,
            },
            videoUrls: [
              "http://ivv.bmcgWcJ3gL+MOplWG44ZAaHC2ulV9egicgMag2HqmFCzf6mn1YmXJsIF02jQWLyfNi9e0RgdOk0",
              "https://yWNQFolWAKMClQAedezIxCs.yrbrfA-Umd7HwG",
              "https://res.cloudinary.com/l7bjl5ep/video/upload/v1784998719/ulo/properties/videos/jx1mgmww5zbykzqzyn0m.mp4",
            ],
            photoUrls: [
              "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784998701/ulo/properties/photos/myhrl0qycvox09ltzxp0.jpg",
            ],
            features: ["string", "string"],
            flagCount: 0,
            availabilityStatus: "available",
            isPublished: true,
            createdAt: "2026-07-25T16:30:00.276Z",
            updatedAt: "2026-07-25T17:05:42.204Z",
          },
        }),
      },
    },
    400: {
      description: "Missing required photo or video before publishing",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message:
              "At least one photo and one video are required before publishing",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    403: { description: "Owner not KYC-verified" },
    404: {
      description: "Not found or not owned by you",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Property not found or not owned by you",
            code: "RESOURCE_NOT_FOUND",
          },
        }),
      },
    },
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
    200: {
      description: "Media uploaded, URLs appended to property",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "597d6e53-aecc-4471-89db-31db04dd5f56",
            ownerId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
            listingTitle: "God's power lodge",
            listingPurpose: "rent",
            description: "a self con wth kitchen and toilet",
            propertyType: "self_contained",
            bedrooms: 0,
            bathrooms: 1,
            price: "300000.00",
            address: "Hilltop UNN",
            location: {
              x: 0,
              y: 0,
            },
            videoUrls: [
              "http://ivv.bmcgWcJ3gL+MOplWG44ZAaHC2ulV9egicgMag2HqmFCzf6mn1YmXJsIF02jQWLyfNi9e0RgdOk0",
              "https://yWNQFolWAKMClQAedezIxCs.yrbrfA-Umd7HwG",
              "https://res.cloudinary.com/l7bjl5ep/video/upload/v1784998719/ulo/properties/videos/jx1mgmww5zbykzqzyn0m.mp4",
            ],
            photoUrls: [
              "https://res.cloudinary.com/l7bjl5ep/image/upload/v1784998701/ulo/properties/photos/myhrl0qycvox09ltzxp0.jpg",
            ],
            features: ["string", "string"],
            flagCount: 0,
            availabilityStatus: "available",
            isPublished: false,
            createdAt: "2026-07-25T16:30:00.276Z",
            updatedAt: "2026-07-25T16:58:40.520Z",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/properties/{propertyId}/save",
  summary: "Save (bookmark) a property for the authenticated user",
  tags: ["Properties"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      propertyId: z
        .string()
        .uuid()
        .openapi({ example: "597d6e53-aecc-4471-89db-31db04dd5f56" }),
    }),
  },
  responses: {
    201: {
      description: "Property saved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "8855655c-6848-4946-84af-e818980d00d4",
            userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
            createdAt: "2026-07-25T23:18:18.270Z",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    404: {
      description: "Property not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Property not found",
            code: "NOT_FOUND",
          },
        }),
      },
    },
    409: {
      description: "Property already saved",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Property is already saved",
            code: "DUPLICATE_ENTRY",
          },
        }),
      },
    },
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
