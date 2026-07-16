import paymentService from "@/services/payment.service";
import crypto from "node:crypto";
import { env } from "@/config/env.config";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class PaymentController {
  static async initializeSubscription(req: Request, res: Response) {
    const { email } = req.user!;
    const data = await paymentService.initializeSubscription(email);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async handleWebhook(req: Request, res: Response) {
    const signature = req.headers["x-paystack-signature"] as string | undefined;
    const rawBody = req.rawBody;

    if (!signature || !rawBody) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Missing signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ success: false, message: "Invalid signature" });
    }

    const event = req.body;
    switch (event.event) {
      case "charge.success":
        await paymentService.activatePremium(event.data.customer.email);
        break;
      case "subscription.disable":
        await paymentService.deactivatePremium(event.data.customer.email);
        break;
      default:
        break;
    }

    // must respond 200 quickly or paystack will retry the webhook
    return res.status(StatusCodes.OK).json({ received: true });
  }
}

export default PaymentController;
