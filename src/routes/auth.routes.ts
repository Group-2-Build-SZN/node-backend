import { Router } from "express";
import AuthController from "@/controllers/auth.controller";
import { validateSchema } from "@/middlewares/validation.middleware";
import { authenticate } from "@/middlewares/authentication.middleware";
import { authRateLimiter } from "@/middlewares/rate-limiter.middleware";
import {
    requestCodeSchema,
    verifyCodeSchema,
    completeProfileSchema,
    googleSignInSchema
} from "@/validations/auth.validation";

const router = Router();

router.post(
    "/google",
    validateSchema(googleSignInSchema),
    AuthController.googleSignIn,
);

router.post(
    "/request-code",
    authRateLimiter,
    validateSchema(requestCodeSchema),
    AuthController.requestCode,
);

router.post(
    "/verify-code",
    validateSchema(verifyCodeSchema, "body"),
    AuthController.verifyCode,
);

router.patch(
    "/complete-profile",
    authenticate,
    validateSchema(completeProfileSchema),
    AuthController.completeProfile,
);

router.post(
    "/refresh",
    AuthController.refresh,
);

router.post(
    "/logout",
    AuthController.logout,
);

export default router;
