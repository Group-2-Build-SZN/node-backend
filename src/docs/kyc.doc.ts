import { registry } from "@/lib/open-api-registry";
import { verifyNinSchema, verifyCacSchema } from "@/validations/kyc.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "post",
  path: "/kyc/verify-nin",
  summary: "Verify user NIN for identity verification (KYC)",
  tags: ["KYC"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: verifyNinSchema,
          example: {
            firstName: "John",
            lastName: "Adamu",
            dateOfBirth: "1990-01-01",
            ninNumber: "70123456789",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "NIN verified successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  userId: { type: "string" },
                  type: { type: "string" },
                  idNumberHash: { type: "string" },
                  idNumberLast4: { type: "string" },
                  status: { type: "string" },
                  providerReference: { type: "string", nullable: true },
                  verifiedAt: { type: "string" },
                  createdAt: { type: "string" },
                },
              },
            },
          },
          example: {
            success: true,
            data: {
              id: "b2f02d53-7850-4057-9094-f5f8f566dd58",
              userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
              type: "nin",
              idNumberHash:
                "8f0dd3d30a1ea4b739c6217c02604aee1556025da990212759efd877206a1948",
              idNumberLast4: "6789",
              status: "verified",
              providerReference: null,
              verifiedAt: "2026-07-25T17:45:55.438Z",
              createdAt: "2026-07-25T18:45:55.450Z",
            },
          },
        },
      },
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
    body: {
      content: {
        "application/json": {
          schema: verifyCacSchema,
          example: {
            companyName: "A, B and C ESSENTIAL VENTURES",
            rcNumber: "1234567",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Verification result: verified, review_needed, or rejected",
      content: {
        "application/json": {
          schema: verifyCacSchema,
          example: {
            success: true,
            data: {
              id: "cb07b47d-6402-4eee-871f-ad70f3aef960",
              userId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
              type: "cac",
              idNumberHash:
                "8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414",
              idNumberLast4: "4567",
              status: "verified",
              providerReference: null,
              verifiedAt: "2026-07-25T15:06:52.029Z",
              createdAt: "2026-07-25T16:06:52.030Z",
            },
          },
        },
      },
    },
    403: {
      description:
        "Forbidden — Business is associated with a blacklisted account",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message:
              "This business is associated with a blocked account and cannot be used to register",
            code: "FORBIDDEN",
          },
        }),
      },
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
    200: {
      description: "Latest verification record",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  userId: { type: "string" },
                  type: { type: "string" },
                  idNumberHash: { type: "string" },
                  idNumberLast4: { type: "string" },
                  status: { type: "string" },
                  providerReference: { type: "string", nullable: true },
                  verifiedAt: { type: "string" },
                  createdAt: { type: "string" },
                },
              },
            },
          },
          example: {
            success: true,
            data: {
              id: "cb07b47d-6402-4eee-871f-ad70f3aef960",
              userId: "7be4fa93-8d56-4bc2-88c5-e95346830679",
              type: "cac",
              idNumberHash:
                "8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414",
              idNumberLast4: "4567",
              status: "verified",
              providerReference: null,
              verifiedAt: "2026-07-25T15:06:52.029Z",
              createdAt: "2026-07-25T16:06:52.030Z",
            },
          },
        },
      },
    },
    404: {
      description: "No verification record found for this user",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
          example: {
            success: false,
            error: {
              message: "No verification record found",
              code: "NOT_FOUND",
            },
          },
        },
      },
    },
  },
});
