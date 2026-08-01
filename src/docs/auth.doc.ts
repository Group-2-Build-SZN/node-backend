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
    body: {
      content: {
        "application/json": {
          schema: requestCodeSchema,
          example: {
            email: "tenant@gmail.com",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Code sent",
      content: {
        "application/json": {
          schema: { type: "object" },
          example: {
            success: true,
            data: {
              message: "Verification code sent to your email",
            },
          },
        },
      },
    },
    429: { description: "Too many requests" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/verify-code",
  summary: "Verify a login code and receive tokens",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: verifyCodeSchema,
          example: {
            email: "tenant@gmail.com",
            code: "644421",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Access token + user; refresh token set as httpOnly cookie",
      content: {
        "application/json": {
          schema: { type: "object" },
          example: {
            success: true,
            data: {
              user: {
                id: "7be4fa93-8d56-4bc2-88c5-e95346830679",
                firstName: null,
                lastName: null,
                email: "tenant@gmail.com",
                phone: null,
                role: null,
                googleId: null,
                avatarUrl: null,
                referralCode: null,
                subscriptionCode: null,
                subscriptionEmailToken: null,
                isPremium: false,
                premiumUntil: null,
                isBlacklisted: false,
                createdAt: "2026-07-25T15:17:06.926Z",
                updatedAt: "2026-07-25T15:17:06.926Z",
              },
              accessToken:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdiZTRmYTkzLThkNTYtNGJjMi04OGM1LWU5NTM0NjgzMDY3OSIsImVtYWlsIjoidGVuYW50QGdtYWlsLmNvbSIsInJvbGUiOm51bGwsImlhdCI6MTc4NDk4OTAyNiwiZXhwIjoxNzg0OTg5OTI2fQ.Bvk4a82KikyvEsOa48b3CJS431d8hAkx052f_50Nz24",
            },
          },
        },
      },
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
      content: {
        "application/json": {
          schema: completeProfileSchema,
          example: {
            firstName: "Jason",
            lastName: "Kabiru",
            phone: "08022222222",
            role: "agent",
            referralCode: "null",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Profile updated successfully",
      content: {
        "application/json": {
          schema: { type: "object" },
          example: {
            success: true,
            data: {
              id: "7be4fa93-8d56-4bc2-88c5-e95346830679",
              firstName: "Jason",
              lastName: "Kabiru",
              email: "tenant@gmail.com",
              phone: "08022222222",
              role: "agent",
              googleId: null,
              avatarUrl: null,
              referralCode: null,
              subscriptionCode: null,
              subscriptionEmailToken: null,
              isPremium: false,
              premiumUntil: null,
              isBlacklisted: false,
              createdAt: "2026-07-25T15:17:06.926Z",
              updatedAt: "2026-07-25T14:58:28.611Z",
            },
          },
        },
      },
    },
    404: { description: "User not found" },
    409: {
      description: "Phone number is already registered to another account",
      content: {
        "application/json": {
          schema: { type: "object" },
          example: {
            success: false,
            error: {
              message:
                "This phone number is already registered to another account",
              code: "DUPLICATE_ENTRY",
            },
          },
        },
      },
    },
  },
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
