import AmenityController from "@/controllers/amenity.controller";
import { validateSchema } from "@/middlewares/validation.middleware";
import { getAmenitiesQuerySchema } from "@/validations/amenity.validation";
import { Router } from "express";

const router = Router();

router.get(
  "/",
  validateSchema(getAmenitiesQuerySchema, "query"),
  AmenityController.getAmenities,
);

export default router;
