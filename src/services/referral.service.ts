import { randomBytes } from "node:crypto";
import { eq, count } from "drizzle-orm";
import { db } from "@/config/database.config";
import { users } from "@/db/schema/users.schema";
import { referrals } from "@/db/schema/referrals.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";

const REWARD_DAYS = 7;

class ReferralService {
  async getOrCreateReferralCode(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (user.referralCode) return user.referralCode;

    const code = `ULO${randomBytes(3).toString("hex").toUpperCase()}`;
    await db
      .update(users)
      .set({ referralCode: code })
      .where(eq(users.id, userId));

    return code;
  }

  async applyReferralCode(referredId: string, code: string) {
    const [referrer] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, code));

    if (!referrer) {
      throw AppError(
        "Invalid referral code",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (referrer.id === referredId) {
      throw AppError(
        "You cannot refer yourself",
        StatusCodes.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
    }

    const rewardUntilReferrer = this.extendPremium(referrer.premiumUntil);
    const [referredUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, referredId));
    const rewardUntilReferred = this.extendPremium(referredUser.premiumUntil);

    await db.transaction(async (tx) => {
      await tx
        .insert(referrals)
        .values({ referrerId: referrer.id, referredId, rewardGranted: true });
      await tx
        .update(users)
        .set({ isPremium: true, premiumUntil: rewardUntilReferrer })
        .where(eq(users.id, referrer.id));
      await tx
        .update(users)
        .set({ isPremium: true, premiumUntil: rewardUntilReferred })
        .where(eq(users.id, referredId));
    });

    return {
      message: `Referral applied! You and ${referrer.firstName ?? "your referrer"} both got ${REWARD_DAYS} days of premium.`,
    };
  }

  private extendPremium(currentUntil: Date | null) {
    const base =
      currentUntil && currentUntil > new Date() ? currentUntil : new Date();
    return new Date(base.getTime() + REWARD_DAYS * 24 * 60 * 60 * 1000);
  }

  async getReferralStats(userId: string) {
    const code = await this.getOrCreateReferralCode(userId);

    const [totalReferred] = await db
      .select({ count: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    return { code, totalReferred: totalReferred.count };
  }
}

export default new ReferralService();
