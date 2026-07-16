import { eq, desc } from "drizzle-orm";
import { db } from "@/config/database.config";
import { verifications } from "@/db/schema/users.schema";
import metamapClient from "@/integrations/metamap";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type {
  verifyNinInput,
  verifyCacInput,
} from "@/validations/kyc.validation";

class KycService {
  async submitNinVerification(userId: string, payload: verifyNinInput) {
    const [verification] = await db
      .insert(verifications)
      .values({
        userId,
        type: "nin",
        idNumber: payload.ninNumber,
        status: "pending",
      })
      .returning();

    await metamapClient.submitNinCheck({
      firstName: payload.firstName,
      lastName: payload.lastName,
      dateOfBirth: payload.dateOfBirth,
      documentNumber: payload.ninNumber,
      metadata: { verificationId: verification.id },
    });

    return verification;
  }

  async submitCacVerification(userId: string, payload: verifyCacInput) {
    const [verification] = await db
      .insert(verifications)
      .values({
        userId,
        type: "cac",
        idNumber: payload.rcNumber,
        status: "pending",
      })
      .returning();

    await metamapClient.submitCacCheck({
      companyName: payload.companyName,
      registrationNumber: payload.rcNumber,
      metadata: { verificationId: verification.id },
    });

    return verification;
  }

  async handleWebhook(
    eventName: string,
    resourceUrl: string,
    metadata: { verificationId?: string },
  ) {
    // Only update database on completed/updated verification states
    if (
      eventName !== "verification_completed" &&
      eventName !== "verification_updated"
    ) {
      return;
    }

    if (!metadata?.verificationId) return;

    const details = await metamapClient.getVerificationDetails(resourceUrl);

    // Safely parse MetaMap's standard resolution status keys
    const rawStatus = details.identityStatus || details.status;

    const statusMap: Record<string, "verified" | "review_needed" | "rejected"> =
      {
        verified: "verified",
        reviewNeeded: "review_needed",
        rejected: "rejected",
      };

    const newStatus = statusMap[rawStatus] ?? "review_needed";

    await db
      .update(verifications)
      .set({
        status: newStatus,
        providerReference: details.id ?? null,
        verifiedAt: newStatus === "verified" ? new Date() : null,
      })
      .where(eq(verifications.id, metadata.verificationId));
  }

  async getVerificationStatus(userId: string) {
    const [verification] = await db
      .select()
      .from(verifications)
      .where(eq(verifications.userId, userId))
      .orderBy(desc(verifications.createdAt))
      .limit(1);

    if (!verification) {
      throw AppError(
        "No verification record found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return verification;
  }
}

export default new KycService();
