import { registry } from "@/lib/open-api-registry";

registry.registerPath({
  method: "post",
  path: "/payments/subscribe",
  summary: "Initialize a Paystack subscription transaction (₦7,500/month)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Returns Paystack authorization_url to complete payment",
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
  responses: { 200: { description: "List of past transactions" } },
});

registry.registerPath({
  method: "get",
  path: "/payments/subscription",
  summary: "Get the current user's subscription status",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "isPremium, premiumUntil, hasActiveSubscription" },
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
    200: { description: "Subscription set to not renew" },
    404: { description: "No active subscription" },
  },
});
