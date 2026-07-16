import PropertyController from "@/controllers/property.controller";
import PropertyFlagController from "@/controllers/property-flag.controller";
import {
  authenticate,
  authorize,
} from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { UserRole } from "@/constants/user-role";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesQuerySchema,
} from "@/validations/property.validation";
import { Router } from "express";

const router = Router();

// public
router.get(
  "/",
  validateSchema(getPropertiesQuerySchema, "query"),
  PropertyController.getProperties,
);
router.get("/:id", PropertyController.getPropertyById);

// agent/landlord only
router.post(
  "/",
  authenticate,
  authorize(UserRole.AGENT, UserRole.LANDLORD),
  validateSchema(createPropertySchema, "body"),
  PropertyController.createProperty,
);

router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.AGENT, UserRole.LANDLORD),
  validateSchema(updatePropertySchema, "body"),
  PropertyController.updateProperty,
);

router.patch(
  "/:id/publish",
  authenticate,
  authorize(UserRole.AGENT, UserRole.LANDLORD),
  PropertyController.publishProperty,
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.AGENT, UserRole.LANDLORD),
  PropertyController.deleteProperty,
);

router.post("/:id/flag", authenticate, PropertyFlagController.flagProperty);
router.delete("/:id/flag", authenticate, PropertyFlagController.unflagProperty);

export default router;
