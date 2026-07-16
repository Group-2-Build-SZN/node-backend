import KycController from "@/controllers/kyc.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { verifyNinSchema, verifyCacSchema } from "@/validations/kyc.validation";
import { Router } from "express";

const router = Router();

router.post(
  "/verify-nin",
  authenticate,
  validateSchema(verifyNinSchema, "body"),
  KycController.verifyNin,
);
router.post(
  "/verify-cac",
  authenticate,
  validateSchema(verifyCacSchema, "body"),
  KycController.verifyCac,
);
router.get("/status", authenticate, KycController.getStatus);

export default router;
