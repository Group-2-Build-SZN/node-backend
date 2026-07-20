import { registry } from "@/lib/open-api-registry";
import {
  requestCodeSchema,
  verifyCodeSchema,
  googleSignInSchema,
  completeProfileSchema,
} from "@/validations/auth.validation";

registry.registerPath({
  method: "post",
  path: "/auth/request-code",
  summary: "Request a one-time login code by email",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: requestCodeSchema } } },
  },
  responses: {
    200: { description: "Code sent" },
    429: { description: "Too many requests" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/verify-code",
  summary: "Verify a login code and receive tokens",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: verifyCodeSchema } } },
  },
  responses: {
    200: {
      description: "Access token + user; refresh token set as httpOnly cookie",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/google",
  summary: "Sign in with Google",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: googleSignInSchema } } },
  },
  responses: {
    200: {
      description: "Access token + user; refresh token set as httpOnly cookie",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/auth/complete-profile",
  summary: "Complete onboarding (name, phone, role)",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: completeProfileSchema } },
    },
  },
  responses: { 200: { description: "Profile updated" } },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  summary: "Exchange refresh token cookie for a new access token",
  tags: ["Auth"],
  responses: {
    200: { description: "New access token" },
    401: { description: "No/invalid refresh token" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  summary: "Clear refresh token cookie",
  tags: ["Auth"],
  responses: { 200: { description: "Logged out" } },
});
