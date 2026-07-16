import { eq } from "drizzle-orm";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import paystackClient from "@/integrations/paystack";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";

const SUBSCRIPTION_PERIOD_DAYS = 30;

class PaymentService {
  async initializeSubscription(email: string) {
    return paystackClient.initializeSubscriptionTransaction(email);
  }

  // called on everycharge.success, both first payent and recurring renewal
  async activatePremium(email: string) {
    const premiumUntil = new Date(
      Date.now() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );

    const [user] = await db
      .update(users)
      .set({ isPremium: true, premiumUntil, updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning();

    if (!user) {
      throw AppError(
        "User not found for this payment",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return user;
  }

  // called on subscription .disable, cancellation is completed or all cycles finished
  async deactivatePremium(email: string) {
    const [user] = await db
      .update(users)
      .set({ isPremium: false, updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning();

    return user;
  }
}

export default new PaymentService();
