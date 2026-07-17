import { registry } from "@/lib/open-api-registry";
import { submitInquirySchema } from "@/validations/inquiry.validation";
import { z } from "@/lib/zod";

registry.registerPath({
  method: "post",
  path: "/properties/{id}/inquiries",
  summary: "Submit an inquiry about a property",
  tags: ["Inquiries"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { "application/json": { schema: submitInquirySchema } } },
  },
  responses: { 201: { description: "Inquiry submitted" } },
});

registry.registerPath({
  method: "get",
  path: "/inquiries",
  summary: "Get the current user's submitted inquiries",
  tags: ["Inquiries"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "List of inquiries with property details" },
  },
});
