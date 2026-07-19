import { registry } from "@/lib/open-api-registry";
import { z } from "@/lib/zod";

registry.registerPath({
  method: "get",
  path: "/saved",
  summary:
    "List the current user's saved properties, optionally filtered by rent/sale",
  tags: ["Saved"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({ listingPurpose: z.enum(["rent", "sale"]).optional() }),
  },
  responses: { 200: { description: "List of saved properties" } },
});

registry.registerPath({
  method: "get",
  path: "/saved/counts",
  summary: "Get saved property counts by listing purpose (all/rent/sale)",
  tags: ["Saved"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "{ all, forRent, forSale }" } },
});
