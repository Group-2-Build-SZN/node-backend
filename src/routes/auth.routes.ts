import { Router } from "express";
import AuthController from "@/controllers/auth.controller";
import { validateSchema } from "@/middlewares/validation.middleware";
import { authenticate } from "@/middlewares/authentication.middleware";
import {
    requestCodeSchema,
    verifyCodeSchema,
    completeProfileSchema,
    googleLoginSchema
} from "@/validations/auth.validation";

const router = Router();

router.post(
    "/google",
    validateSchema(googleLoginSchema),
    AuthController.googleLogin,
);

router.post(
    "/request-code",
    validateSchema(requestCodeSchema),
    AuthController.requestCode,
);

router.post(
    "/verify-code",
    validateSchema(verifyCodeSchema),
    AuthController.verifyCode,
);

router.patch(
    "/profile",
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