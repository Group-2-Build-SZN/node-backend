import { registry } from "@/lib/open-api-registry";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "post",
  path: "/payments/subscribe",
  summary: "Initialize a Paystack subscription transaction (₦7,500/month)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Returns Paystack authorization_url to complete payment",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            authorization_url: "https://checkout.paystack.com/qy3vma68z4efp3j",
            access_code: "qy3vma68z4efp3j",
            reference: "huge2cbjya",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    500: {
      description: "Paystack initialization error",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Unable to initialize payment transaction",
            code: "PAYMENT_INIT_FAILED",
          },
        }),
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/payments/webhook",
  summary:
    "Paystack webhook receiver — verified via HMAC SHA512 signature, not user auth",
  tags: ["Payments"],
  responses: {
    200: { description: "Event processed" },
    401: { description: "Invalid signature" },
  },
});

registry.registerPath({
  method: "get",
  path: "/payments/history",
  summary: "Get the current user's payment transaction history",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of past transactions retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: [
            {
              id: "58163398-8e21-4d83-ac25-43d35c447020",
              userId: "5311b044-ebda-4fb9-9f6d-470be0bb37fd",
              paystackReference: "huge2cbjya",
              amount: "7500.00",
              status: "success",
              cardType: "visa ",
              cardLast4: "4081",
              paidAt: "2026-07-25T23:12:08.000Z",
              createdAt: "2026-07-26T00:12:10.276Z",
            },
          ],
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "get",
  path: "/payments/subscription",
  summary: "Get the current user's subscription status",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "User subscription status retrieved successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            isPremium: true,
            premiumUntil: "2026-08-24T23:12:10.262Z",
            hasActiveSubscription: true,
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
  },
});

registry.registerPath({
  method: "post",
  path: "/payments/cancel",
  summary:
    "Cancel the current user's subscription (access continues until period end)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Subscription set to not renew",
      content: {
        "application/json": jsonContent({
          success: true,
          data: {
            message:
              "Subscription will not renew. Access continues until your current period ends.",
          },
        }),
      },
    },
    401: { description: "Not authenticated" },
    404: {
      description: "No active subscription found",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "No active subscription found to cancel",
            code: "NOT_FOUND",
          },
        }),
      },
    },
  },
});
