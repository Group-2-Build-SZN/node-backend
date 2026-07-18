import { registry } from "@/lib/open-api-registry";
import { getAmenitiesQuerySchema } from "@/validations/amenity.validation";

registry.registerPath({
  method: "get",
  path: "/amenities",
  summary:
    "List amenities (filling stations, markets, schools, hospitals, town centers) with optional proximity search",
  tags: ["Amenities"],
  request: { query: getAmenitiesQuerySchema },
  responses: { 200: { description: "List of amenities" } },
});
