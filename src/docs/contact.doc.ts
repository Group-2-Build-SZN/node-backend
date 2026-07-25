import { registry } from "@/lib/open-api-registry";
import { submitContactMessageSchema } from "@/validations/contact.validation";

registry.registerPath({
  method: "post",
  path: "/contact",
  summary: "Submit a message via the public Contact Us form",
  tags: ["Contact"],
  request: {
    body: {
      content: { "application/json": { schema: submitContactMessageSchema } },
    },
  },
  responses: {
    201: { description: "Message sent" },
    429: { description: "Too many messages sent" },
  },
});
