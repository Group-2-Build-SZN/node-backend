import PropertyController from "@/controllers/property.controller";
import SavedPropertyController from "@/controllers/saved-property.controller";
import PropertyReportController from "@/controllers/property-report.controller";
import InquiryController from "@/controllers/inquiry.controller";
import {
  propertyMediaUpload,
  reportEvidenceUpload,
} from "@/middlewares/upload.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { submitInquirySchema } from "@/validations/inquiry.validation";
import { submitReportSchema } from "@/validations/property-report.validation";
import {
  authenticate,
  authorize,
  attachUserIfPresent,
} from "@/middlewares/authentication.middleware";

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
  attachUserIfPresent,
  validateSchema(getPropertiesQuerySchema, "query"),
  PropertyController.getProperties,
);
router.get("/recommended", PropertyController.getRecommendedProperties);
router.get("/:id", attachUserIfPresent, PropertyController.getPropertyById);
router.post("/:id/save", authenticate, SavedPropertyController.saveProperty);
router.post(
  "/:id/inquiries",
  authenticate,
  validateSchema(submitInquirySchema, "body"),
  InquiryController.submitInquiry,
);

router.delete(
  "/:id/save",
  authenticate,
  SavedPropertyController.unsaveProperty,
);

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

router.post(
  "/:id/media",
  authenticate,
  authorize(UserRole.AGENT, UserRole.LANDLORD),
  propertyMediaUpload,
  PropertyController.addMedia,
);

router.post(
  "/:id/report",
  authenticate,
  reportEvidenceUpload,
  validateSchema(submitReportSchema, "body"),
  PropertyReportController.submitReport,
);

export default router;
