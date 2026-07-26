import { registry } from "@/lib/open-api-registry";
import { getAmenitiesQuerySchema } from "@/validations/amenity.validation";
import { z } from "zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/amenities",
  summary:
    "List amenities (filling stations, markets, schools, hospitals, town centers) with optional proximity search",
  tags: ["Amenities"],
  request: { query: getAmenitiesQuerySchema },
  responses: {
    200: {
      description: "List of amenities retrieved successfully",
      content: {
        "application/json": {
          schema: z.any(),
          examples: {
            standardList: {
              summary: "Basic filter by type (e.g. type=filling_station)",
              value: {
                success: true,
                data: [
                  {
                    id: "65666820-4e65-4f85-8c0a-e435499d5d37",
                    name: "Total Filling Station, New Haven",
                    type: "filling_station",
                    longitude: 7.5157,
                    latitude: 6.4623,
                  },
                ],
              },
            },
            proximitySearch: {
              summary:
                "Proximity search (e.g. lat=6.4610&lng=7.5150&radiusKm=2)",
              value: {
                success: true,
                data: [
                  {
                    id: "9330eac5-dfb5-49ec-8288-40693eef92a5",
                    name: "New Haven Market",
                    type: "market",
                    longitude: 7.5169,
                    latitude: 6.4611,
                    distance_meters: 210,
                  },
                ],
              },
            },
          },
        },
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
