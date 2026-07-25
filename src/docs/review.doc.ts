import { registry } from "@/lib/open-api-registry";
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
} from "@/validations/review.validation";
import { z } from "@/lib/zod";

registry.registerPath({
  method: "get",
  path: "/properties/{propertyId}/reviews",
  summary:
    "Get reviews for a property, split into verified-resident and community-tip",
  tags: ["Reviews"],
  request: {
    params: z.object({ propertyId: z.string().uuid() }),
    query: getReviewsQuerySchema,
  },
  responses: { 200: { description: "Paginated reviews" } },
});

registry.registerPath({
  method: "post",
  path: "/properties/{propertyId}/reviews",
  summary:
    "Submit a review — GPS-gated; limited to once per property per 30 days",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ propertyId: z.string().uuid() }),
    body: { content: { "application/json": { schema: createReviewSchema } } },
  },
  responses: {
    201: { description: "Review submitted" },
    404: { description: "Property not found" },
    429: {
      description: "Already reviewed this property within the last 30 days",
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
      propertyId: z.string().uuid(),
      reviewId: z.string().uuid(),
    }),
    body: { content: { "application/json": { schema: updateReviewSchema } } },
  },
  responses: {
    200: { description: "Review updated" },
    404: { description: "Not found or not yours" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/properties/{propertyId}/reviews/{reviewId}",
  summary: "Delete your own review",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      propertyId: z.string().uuid(),
      reviewId: z.string().uuid(),
    }),
  },
  responses: {
    200: { description: "Review deleted" },
    404: { description: "Not found or not yours" },
  },
});
