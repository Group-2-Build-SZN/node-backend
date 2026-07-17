import { z } from "zod";

export const propertyTypeValues = [
  "self_contained",
  "single_room",
  "one_bedroom_flat",
  "two_bedroom_flat",
  "three_bedroom_flat",
  "duplex",
  "bungalow",
  "shared_apartment",
] as const;

export const createPropertySchema = z.object({
  listingTitle: z.string().trim().min(1).max(150),
  listingPurpose: z.enum(["rent", "sale"]).default("rent"),
  description: z.string().trim().max(1000).optional(),
  propertyType: z.enum(propertyTypeValues),
  bedrooms: z.coerce.number().int().min(0).max(20).default(0),
  bathrooms: z.coerce.number().int().min(0).max(20).default(0),
  price: z.coerce.number().positive(),
  address: z.string().trim().min(1).max(300),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  videoUrls: z.array(z.string().url()).optional(),
  features: z.array(z.string()).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyIdSchema = z.object({
  id: z.string().uuid("Invalid property ID"),
});

const commaSeparated = z.string().transform((val) =>
  val
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean),
);

export const getPropertiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  search: z.string().trim().max(200).optional(),
  propertyType: commaSeparated.optional(),
  listingPurpose: z.enum(["rent", "sale"]).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  features: commaSeparated.optional(),
  verifiedOnly: z.coerce.boolean().optional().default(false),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(100).optional().default(10),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type GetPropertiesQuery = z.infer<typeof getPropertiesQuerySchema>;
