import { registry } from "@/lib/open-api-registry";
import { applyReferralSchema } from "@/validations/referral.validation";

registry.registerPath({
  method: "get",
  path: "/referrals/me",
  summary:
    "Get (or generate) the current user's referral code and referral count",
  tags: ["Referrals"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Referral code and stats" } },
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
