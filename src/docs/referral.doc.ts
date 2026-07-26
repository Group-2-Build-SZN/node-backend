import { registry } from "@/lib/open-api-registry";
import { applyReferralSchema } from "@/validations/referral.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "get",
  path: "/referrals/me",
  summary:
    "Get (or generate) the current user's referral code and referral count",
  tags: ["Referrals"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Referral code and stats retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            code: "ULO65F89C",
            totalReferred: 0,
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "post",
  path: "/referrals/apply",
  summary: "Apply a referral code — grants both parties 7 days of premium",
  tags: ["Referrals"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: applyReferralSchema } } },
  },
  responses: {
    200: { description: "Referral applied" },
    404: { description: "Invalid code" },
  },
});
