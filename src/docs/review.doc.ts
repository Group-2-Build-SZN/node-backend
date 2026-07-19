import { registry } from "@/lib/open-api-registry";
import {
  createReviewSchema,
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
    "Submit a review — GPS-gated; matches within ~150m are labeled verified_resident",
  tags: ["Reviews"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ propertyId: z.string().uuid() }),
    body: { content: { "application/json": { schema: createReviewSchema } } },
  },
  responses: {
    201: { description: "Review submitted" },
    404: { description: "Property not found" },
  },
});
