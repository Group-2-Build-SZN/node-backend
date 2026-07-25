import { createHash } from "node:crypto";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/config/database.config";
import { verifications, users } from "@/db/schema/users.schema";
import dojahClient from "@/lib/dojah";
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

function hashIdnumber(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

class KycService {
  private async isBlockedByBlacklist(type: "nin" | "cac", idNumber: string) {
    const idNumberHash = hashIdnumber(idNumber);

    const [match] = await db
      .select({ id: verifications.id })
      .from(verifications)
      .innerJoin(users, eq(users.id, verifications.userId))
      .where(
        and(
          eq(verifications.type, type),
          eq(verifications.idNumberHash, idNumberHash),
          eq(users.isBlacklisted, true),
        ),
      );
    return Boolean(match);
  }

  async submitNinVerification(userId: string, payload: VerifyNinInput) {
    const blocked = await this.isBlockedByBlacklist("nin", payload.ninNumber);
    if (blocked) {
      throw AppError(
        "Ths identity is associated with a blocked account and cannot be used to register",
        StatusCodes.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    const result = await dojahClient.lookupNin(payload.ninNumber);

    const entity = result?.entity;

    let status: VerificationOutcome = "rejected";

    if (entity) {
      const firstNameMatch = namesMatch(
        entity.first_name ?? "",
        payload.firstName,
      );
      const lastNameMatch = namesMatch(
        entity.last_name ?? "",
        payload.lastName,
      );
      status = firstNameMatch && lastNameMatch ? "verified" : "review_needed";
    }

    const [verification] = await db
      .insert(verifications)
      .values({
        userId,
        type: "nin",
        idNumberHash: hashIdnumber(payload.ninNumber),
        idNumberLast4: payload.ninNumber.slice(-4),
        status,
        providerReference: entity?.reference_id ?? null,
        verifiedAt: status === "verified" ? new Date() : null,
      })
      .returning();

    return verification;
  }

  async submitCacVerification(userId: string, payload: VerifyCacInput) {
    const blocked = await this.isBlockedByBlacklist("cac", payload.rcNumber);
    if (blocked) {
      throw AppError(
        "This busines is associated with a blocked account and cannot be used to register",
        StatusCodes.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    const result = await dojahClient.lookupCac(payload.rcNumber);

    const entity = result?.entity;

    let status: VerificationOutcome = "rejected";

    if (entity) {
      const nameMatch = namesMatch(
        entity.company_name ?? "",
        payload.companyName,
      );
      status = nameMatch ? "verified" : "review_needed";
    }

    const [verification] = await db
      .insert(verifications)
      .values({
        userId,
        type: "cac",
        idNumberHash: hashIdnumber(payload.rcNumber),
        idNumberLast4: payload.rcNumber.slice(-4),
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
