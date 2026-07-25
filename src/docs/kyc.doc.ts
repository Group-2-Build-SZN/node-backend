import { registry } from "@/lib/open-api-registry";
import { verifyNinSchema, verifyCacSchema } from "@/validations/kyc.validation";

registry.registerPath({
  method: "post",
  path: "/kyc/verify-nin",
  summary: "Verify identity via NIN (Dojah synchronous lookup)",
  tags: ["KYC"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: verifyNinSchema } } },
  },
  responses: {
    201: {
      description: "Verification result: verified, review_needed, or rejected",
    },
    403: { description: "This NIN is associated with a blacklisted account" },
  },
});

registry.registerPath({
  method: "post",
  path: "/kyc/verify-cac",
  summary: "Verify a business via CAC/RC number (Dojah synchronous lookup)",
  tags: ["KYC"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: verifyCacSchema } } },
  },
  responses: {
    201: {
      description: "Verification result: verified, review_needed, or rejected",
    },
    403: {
      description: "This RC number is associated with a blacklisted account",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/kyc/status",
  summary: "Get the current user's latest verification status",
  tags: ["KYC"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "Latest verification record" },
    404: { description: "No verification found" },
  },
});
