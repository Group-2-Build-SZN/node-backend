import { registry } from "@/lib/open-api-registry";
import { submitReportSchema } from "@/validations/property-report.validation";
import { z } from "@/lib/zod";

registry.registerPath({
  method: "post",
  path: "/properties/{id}/report",
  summary:
    "Report a property (reason, optional description, optional evidence — multipart/form-data)",
  tags: ["Property Reports"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "multipart/form-data": {
          schema: submitReportSchema.extend({
            evidence: z
              .array(z.string())
              .optional()
              .openapi({
                description: "Up to 5 image/video files",
                type: "string",
                format: "binary",
              } as any),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description:
        "Report submitted with a reference ID (e.g. MU-2026-07-17-12847)",
    },
  },
});
