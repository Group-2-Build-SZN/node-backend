import { z } from "zod";

export const amenityTypeValues = [
  "filling_station",
  "shop",
  "market",
  "hospital",
  "school",
  "town_center",
] as const;

export const getAmenitiesQuerySchema = z.object({
  type: z.enum(amenityTypeValues).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(50).optional().default(5),
});

export type GetAmenitiesQuery = z.infer<typeof getAmenitiesQuerySchema>;
