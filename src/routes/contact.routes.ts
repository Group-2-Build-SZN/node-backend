import ContactController from "@/controllers/contact.controller";
import { validateSchema } from "@/middlewares/validation.middleware";
import { contactRateLimiter } from "@/middlewares/rate-limiter.middleware";
import { submitContactMessageSchema } from "@/validations/contact.validation";
import { Router } from "express";

const router = Router();

router.post(
  "/",
  contactRateLimiter,
  validateSchema(submitContactMessageSchema, "body"),
  ContactController.submitMessage,
);

export default router;
