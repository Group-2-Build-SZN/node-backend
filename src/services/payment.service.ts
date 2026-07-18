import { eq, desc } from "drizzle-orm";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { paymentTransactions } from "@/db/schema/payment-transactions.schema";
import paystackClient from "@/lib/paystack";
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

  async recordTransaction(userId: string, event: any) {
    await db
      .insert(paymentTransactions)
      .values({
        userId,
        paystackReference: event.data.reference,
        amount: (event.data.amount / 100).toString(),
        status: "success",
        cardType: event.data.authorization?.card_type ?? null,
        cardLast4: event.data.authorization?.last4 ?? null,
        paidAt: new Date(event.data.paid_at ?? Date.now()),
      })
      .onConflictDoNothing();
  }

  async getSubscriptionStatus(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return {
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      hasActiveSubscription: Boolean(user.subscriptionCode),
    };
  }

  async cancelSubscription(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user.subscriptionCode || !user.subscriptionEmailToken) {
      throw AppError(
        "No active subscription found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    await paystackClient.disableSubscription(
      user.subscriptionCode,
      user.subscriptionEmailToken,
    );
    return {
      message:
        "Subscription will not renew. Access continues until your current period ends.",
    };
  }

  async getTransactionHistory(userId: string) {
    return db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.paidAt));
  }

  async storeSubscriptionCode(
    email: string,
    subscriptionCode: string,
    emailToken: string,
  ) {
    await db
      .update(users)
      .set({ subscriptionCode, subscriptionEmailToken: emailToken })
      .where(eq(users.email, email));
  }
}

export default new PaymentService();
