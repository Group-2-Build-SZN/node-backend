import InquiryController from "@/controllers/inquiry.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { submitInquirySchema } from "@/validations/inquiry.validation";
import { Router } from "express";

const router = Router();

router.get("/", authenticate, InquiryController.getMyInquiries);

export default router;
