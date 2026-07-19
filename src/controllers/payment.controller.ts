import { eq } from "drizzle-orm";
import paymentService from "@/services/payment.service";
import crypto from "node:crypto";
import { env } from "@/config/env.config";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "@/config/database.config";
import { users } from "@/db/schema";

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
      case "charge.success": {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, event.data.customer.email));

        if (user) {
          await paymentService.activatePremium(event.data.customer.email);
          await paymentService.recordTransaction(user.id, event);
        }
        break;
      }

      case "subscription.create": {
        await paymentService.storeSubscriptionCode(
          event.data.customer.email,
          event.data.subscription_code,
          event.data.email_token,
        );
        break;
      }
      case "subscription.disable":
        await paymentService.deactivatePremium(event.data.customer.email);
        break;
      default:
        break;
    }

    // must respond 200 quickly or paystack will retry the webhook
    return res.status(StatusCodes.OK).json({ received: true });
  }

  static async getSubscriptionStatus(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await paymentService.getSubscriptionStatus(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async cancelSubscription(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await paymentService.cancelSubscription(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getHistory(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await paymentService.getTransactionHistory(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default PaymentController;
