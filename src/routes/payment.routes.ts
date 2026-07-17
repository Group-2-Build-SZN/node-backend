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
router.get(
  "/subscription",
  authenticate,
  PaymentController.getSubscriptionStatus,
);
router.post("/cancel", authenticate, PaymentController.cancelSubscription);
router.get("/history", authenticate, PaymentController.getHistory);

export default router;
