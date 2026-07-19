import "@/docs"; // ensures every doc file registers before generating
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "@/lib/open-api-registry";

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "My Ulo API",
      version: "1.0.0",
      description:
        "Backend API for My Ulo — verified rental and purchase properties in Nigeria.",
    },
    servers: [{ url: "/api/v1" }],
  });
}
