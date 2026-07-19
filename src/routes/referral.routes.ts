import ReferralController from "@/controllers/referral.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { applyReferralSchema } from "@/validations/referral.validation";
import { Router } from "express";

const router = Router();

router.get("/me", authenticate, ReferralController.getMyReferralStats);
router.post(
  "/apply",
  authenticate,
  validateSchema(applyReferralSchema, "body"),
  ReferralController.applyCode,
);

export default router;
