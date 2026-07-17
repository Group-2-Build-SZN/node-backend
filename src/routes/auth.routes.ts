import { Router } from "express";
import AuthController from "@/controllers/auth.controller";
import { validateSchema } from "@/middlewares/validation.middleware";
import {
    requestCodeSchema,
    verifyCodeSchema,
} from "@/validations/auth.validation";

const router = Router();

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

export default router;