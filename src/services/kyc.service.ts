import { eq, desc } from "drizzle-orm";
import { db } from "@/config/database.config";
import { verifications } from "@/db/schema/users.schema";
import dojahClient from "@/integrations/dojah";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type {
  VerifyNinInput,
  VerifyCacInput,
} from "@/validations/kyc.validation";

type VerificationOutcome = "verified" | "review_needed" | "rejected";

function namesMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

class KycService {
  async submitNinVerification(userId: string, payload: VerifyNinInput) {
    const result = await dojahClient.lookupNin(payload.ninNumber);
    const entity = result?.entity;

    let status: VerificationOutcome = "rejected";

    if (entity) {
      const firstNameMatch = namesMatch(
        entity.first_name ?? "",
        payload.firstName,
      );
      const lastNameMatch = namesMatch(
        entity.last_name ?? entity.surname ?? "",
        payload.lastName,
      );
      status = firstNameMatch && lastNameMatch ? "verified" : "review_needed";
    }

    const [verification] = await db
      .insert(verifications)
      .values({
        userId,
        type: "nin",
        idNumber: payload.ninNumber,
        status,
        providerReference: entity?.reference_id ?? null,
        verifiedAt: status === "verified" ? new Date() : null,
      })
      .returning();

    return verification;
  }

  async submitCacVerification(userId: string, payload: VerifyCacInput) {
    const result = await dojahClient.lookupCac(payload.rcNumber);
    const entity = result?.entity;

    let status: VerificationOutcome = "rejected";

    if (entity) {
      const nameMatch = namesMatch(
        entity.business_name ?? entity.company_name ?? "",
        payload.companyName,
      );
      status = nameMatch ? "verified" : "review_needed";
    }

    const [verification] = await db
      .insert(verifications)
      .values({
        userId,
        type: "cac",
        idNumber: payload.rcNumber,
        status,
        providerReference: entity?.reference_id ?? null,
        verifiedAt: status === "verified" ? new Date() : null,
      })
      .returning();

    return verification;
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
