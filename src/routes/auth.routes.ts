import AuthController from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { authRateLimiter } from "@/middlewares/rate-limiter.middleware";
import {
  requestCodeSchema,
  verifyCodeSchema,
  googleSignInSchema,
  completeProfileSchema,
} from "@/validations/auth.validation";
import { Router } from "express";

const router = Router();

router.post(
  "/request-code",
  authRateLimiter,
  validateSchema(requestCodeSchema, "body"),
  AuthController.requestCode,
);

router.post(
  "/verify-code",
  validateSchema(verifyCodeSchema, "body"),
  AuthController.verifyCode,
);

router.post(
  "/google",
  validateSchema(googleSignInSchema, "body"),
  AuthController.googleSignIn,
);

router.patch(
  "/complete-profile",
  authenticate,
  validateSchema(completeProfileSchema, "body"),
  AuthController.completeProfile,
);

router.post("/refresh", AuthController.refresh);

router.post("/logout", AuthController.logout);

export default router;
