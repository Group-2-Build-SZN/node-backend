import { registry } from "@/lib/open-api-registry";
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
} from "@/validations/review.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/properties/{propertyId}/reviews",
  summary:
    "Get reviews for a property, split into verified-resident and community-tip",
  tags: ["Reviews"],
  request: {
    params: z.object({
      propertyId: z
        .string()
        .uuid()
        .openapi({ example: "597d6e53-aecc-4471-89db-31db04dd5f56" }),
    }),
    query: getReviewsQuerySchema,
  },
  responses: {
    200: {
      description: "Paginated list of reviews categorized by reviewer type",
      content: {
        "application/json": jsonContent({
          success: true,
          verifiedResident: [],
          communityTip: [
            {
              id: "ce8afc31-15f3-4b9c-909f-c402cad0e8a7",
              property_id: "597d6e53-aecc-4471-89db-31db04dd5f56",
              reviewer_id: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
              review_type: "community_tip",
              water_rating: 4,
              electricity_rating: 1,
              security_rating: 1,
              review_text: "there is hardly electricity",
              photo_urls: null,
              submitted_lat: -9.055394571800818,
              submitted_lng: 47.166999917728134,
              distance_from_property_metres: 5322797,
              created_at: "2026-07-25 22:28:21.379397",
              road_accessibility_rating: 1,
              cleanliness_rating: 1,
              updated_at: "2026-07-25 22:28:21.379397",
              reviewer_first_name: "John",
              reviewer_last_name: "Adamu",
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
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
  path: "/properties/{propertyId}/reviews",
  summary:
    "Submit a review — GPS-gated; limited to once per property per 30 days",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      propertyId: z
        .string()
        .uuid()
        .openapi({ example: "597d6e53-aecc-4471-89db-31db04dd5f56" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: createReviewSchema,
          example: {
            waterRating: 4,
            electricityRating: 1,
            securityRating: 1,
            roadAccessibilityRating: 1,
            cleanlinessRating: 1,
            submittedLat: -9.055394571800818,
            submittedLng: 47.166999917728134,
            reviewText: "there is hardly electricity",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Review submitted successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "ce8afc31-15f3-4b9c-909f-c402cad0e8a7",
            propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
            reviewerId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            reviewType: "community_tip",
            waterRating: 4,
            electricityRating: 1,
            securityRating: 1,
            roadAccessibilityRating: 1,
            cleanlinessRating: 1,
            reviewText: "there is hardly electricity",
            photoUrls: null,
            submittedLat: -9.055394571800818,
            submittedLng: 47.166999917728134,
            distanceFromPropertyMetres: 5322797,
            createdAt: "2026-07-25T22:28:21.379Z",
            updatedAt: "2026-07-25T22:28:21.379Z",
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
    429: {
      description: "Already reviewed this property within the last 30 days",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "You can only review this property once every 30 days",
            code: "DUPLICATE_ENTRY",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/properties/{propertyId}/reviews/{reviewId}",
  summary:
    "Edit your own review (ratings/text only — GPS/location cannot be changed after submission)",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      propertyId: z
        .string()
        .uuid()
        .openapi({ example: "597d6e53-aecc-4471-89db-31db04dd5f56" }),
      reviewId: z
        .string()
        .uuid()
        .openapi({ example: "ce8afc31-15f3-4b9c-909f-c402cad0e8a7" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateReviewSchema,
          example: {
            waterRating: 4,
            electricityRating: 3,
            securityRating: 4,
            roadAccessibilityRating: 1,
            cleanlinessRating: 1,
            reviewText: "the electricity has been constant now",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Review updated successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            id: "ce8afc31-15f3-4b9c-909f-c402cad0e8a7",
            propertyId: "597d6e53-aecc-4471-89db-31db04dd5f56",
            reviewerId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
            reviewType: "community_tip",
            waterRating: 4,
            electricityRating: 3,
            securityRating: 4,
            roadAccessibilityRating: 1,
            cleanlinessRating: 1,
            reviewText: "the electricity has been constant now",
            photoUrls: null,
            submittedLat: -9.055394571800818,
            submittedLng: 47.166999917728134,
            distanceFromPropertyMetres: 5322797,
            createdAt: "2026-07-25T22:28:21.379Z",
            updatedAt: "2026-07-25T21:56:39.531Z",
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
    404: {
      description: "Review not found or not owned by you",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message:
              "Review not found or you do not have permission to edit it",
            code: "RESOURCE_NOT_FOUND",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/properties/{propertyId}/reviews/{reviewId}",
  summary: "Delete a review (own review or admin override)",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      propertyId: z
        .string()
        .uuid()
        .openapi({ example: "597d6e53-aecc-4471-89db-31db04dd5f56" }),
      reviewId: z
        .string()
        .uuid()
        .openapi({ example: "ce8afc31-15f3-4b9c-909f-c402cad0e8a7" }),
    }),
  },
  responses: {
    200: {
      description: "Review deleted successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          message: "Review deleted",
        }),
      },
    },
    401: { description: "Not authenticated" },
    403: {
      description: "Forbidden — user does not own this review",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "You are not authorized to delete this review",
            code: "FORBIDDEN",
          },
        }),
      },
    },
    404: {
      description: "Review or property not found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Review not found",
            code: "NOT_FOUND",
          },
        }),
      },
    },
  },
});
