import { registry } from "@/lib/open-api-registry";
import { submitContactMessageSchema } from "@/validations/contact.validation";
import { z } from "@/lib/zod";

const jsonContent = (example: unknown) => ({
  schema: z.any().openapi({
    example,
  }),
});

registry.registerPath({
  method: "post",
  path: "/contact",
  summary: "Submit a message via the public Contact Us form",
  tags: ["Contact"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: submitContactMessageSchema,
          example: {
            fullName: "Chinedu Okafor",
            email: "anakorafav@gmail.com",
            subject: "Question",
            message: "I have an issue with the app.",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Message sent successfully",
      content: {
        "application/json": jsonContent({
          success: true,
          message: "Message sent successfully",
        }),
      },
    },
    400: {
      description: "Validation error in request body",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Validation error",
            code: "INVALID_INPUT",
          },
        }),
      },
    },
    429: {
      description: "Too many messages sent. Please try again later.",
      content: {
        "application/json": jsonContent({
          success: false,
          error: {
            message: "Rate limit exceeded",
            code: "TOO_MANY_REQUESTS",
          },
        }),
      },
    },
  },
});
