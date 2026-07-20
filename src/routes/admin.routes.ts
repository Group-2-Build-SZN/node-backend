import AdminController from "@/controllers/admin.controller";
import {
  authenticate,
  authorize,
} from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { UserRole } from "@/constants/user-role";
import {
  updatePropertyStatusSchema,
  resolveKycSchema,
  blacklistUserSchema,
} from "@/validations/admin.validation";
import { Router } from "express";

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get("/reports", AdminController.listReports);
router.patch(
  "/properties/:id/status",
  validateSchema(updatePropertyStatusSchema, "body"),
  AdminController.updatePropertyStatus,
);
router.get("/kyc/review-needed", AdminController.listKycReviewNeeded);
router.patch(
  "/kyc/:id/resolve",
  validateSchema(resolveKycSchema, "body"),
  AdminController.resolveKyc,
);
router.patch(
  "/users/:id/blacklist",
  validateSchema(blacklistUserSchema, "body"),
  AdminController.setBlacklistStatus,
);

export default router;
