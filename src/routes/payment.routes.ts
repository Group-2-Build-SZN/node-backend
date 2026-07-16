import PaymentController from "@/controllers/payment.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { Router } from "express";

const router = Router();

router.post(
  "/subscribe",
  authenticate,
  PaymentController.initializeSubscription,
);
router.post("/webhook", PaymentController.handleWebhook);

export default router;
