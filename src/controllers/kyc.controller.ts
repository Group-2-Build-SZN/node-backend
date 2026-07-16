import crypto from "node:crypto";
import kycService from "@/services/kyc.service";
import { env } from "@/config/env.config";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class KycController {
  static async verifyNin(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await kycService.submitNinVerification(userId, req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async verifyCac(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await kycService.submitCacVerification(userId, req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async handleWebhook(req: Request, res: Response) {
    const signature = req.headers["x-signature"] as string | undefined;

    if (!signature || !req.body) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing signature or payload body",
      });
    }

    try {
      // MetaMap signatures are verified by hashing the stringified JSON payload
      const payloadString = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", env.METAMAP_WEBHOOK_SECRET)
        .update(payloadString)
        .digest("hex");

      const isValid =
        expectedSignature.length === signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(expectedSignature, "utf8"),
          Buffer.from(signature, "utf8"),
        );

      if (!isValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Invalid signature",
        });
      }

      const { eventName, resource, metadata } = req.body;

      // Process the webhook asynchronously to return a quick 200 OK back to MetaMap
      await kycService.handleWebhook(eventName, resource, metadata);

      return res.status(StatusCodes.OK).json({ received: true });
    } catch (error) {
      // Log error internally but return OK/Error to MetaMap to prevent continuous retry loops
      console.error("MetaMap Webhook Processing Error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Webhook processing failed",
      });
    }
  }

  static async getStatus(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await kycService.getVerificationStatus(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default KycController;
