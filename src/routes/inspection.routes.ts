import InspectionController from "@/controllers/inspection.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { updateInspectionStatusSchema } from "@/validations/inspection.validation";
import { Router } from "express";

const router = Router();

// tenant-facing
router.get("/me", authenticate, InspectionController.getMyInspections);

// agent/landlord-facing
router.get(
  "/agent/me",
  authenticate,
  InspectionController.getInspectionsForAgent,
);

router.patch(
  "/:id/status",
  authenticate,
  validateSchema(updateInspectionStatusSchema, "body"),
  InspectionController.updateStatus,
);

export default router;
