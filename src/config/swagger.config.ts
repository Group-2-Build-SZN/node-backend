import { generateOpenApiDocument } from "@/lib/open-api";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

export function setupSwagger(app: Express) {
  const document = generateOpenApiDocument();

  const swaggerOptions = {
    customSiteTitle: "MyUlo API Documentation",
    customCss: `
      
      body {
        background-color: #0d1117 !important;
        margin: 0;
      }
      .swagger-ui {
        background-color: #0d1117 !important;
        color: #c9d1d9 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      }
      .swagger-ui .info .title {
        color: #f0f6fc !important;
      }
      .swagger-ui .info, .swagger-ui .info p, .swagger-ui .info a {
        color: #8b949e !important;
      }
      
      /* Server Dropdown & Authorize Section */
      .swagger-ui .scheme-container {
        background-color: #161b22 !important;
        box-shadow: none !important;
        border: 1px solid #30363d !important;
        border-radius: 6px;
        padding: 15px !important;
      }
      .swagger-ui select {
        background-color: #0d1117 !important;
        color: #c9d1d9 !important;
        border: 1px solid #30363d !important;
        border-radius: 6px;
      }
      .swagger-ui .btn.authorize {
        border-color: #10b981 !important;
        color: #10b981 !important;
        background-color: transparent !important;
        border-radius: 4px;
      }
      .swagger-ui .btn.authorize svg {
        fill: #10b981 !important;
      }

      /* Sections & Groupings Headers */
      .swagger-ui .opblock-tag-section {
        background: transparent !important;
      }
      .swagger-ui .opblock-tag {
        color: #f0f6fc !important;
        border-bottom: 1px solid #21262d !important;
        font-size: 18px !important;
      }

      /* Method Blocks (POST, GET, PATCH, DELETE custom styles) */
      .swagger-ui .opblock {
        background-color: #161b22 !important;
        border-radius: 6px !important;
        box-shadow: none !important;
      }
      
      /* POST Method Accent */
      .swagger-ui .opblock.opblock-post {
        border: 1px solid rgba(16, 185, 129, 0.4) !important;
        background-color: rgba(16, 185, 129, 0.03) !important;
      }
      .swagger-ui .opblock.opblock-post .opblock-summary-method {
        background-color: #10b981 !important;
        color: #ffffff !important;
        border-radius: 4px;
      }
      .swagger-ui .opblock.opblock-post .opblock-summary-path {
        color: #c9d1d9 !important;
      }

      /* GET Method Accent */
      .swagger-ui .opblock.opblock-get {
        border: 1px solid rgba(59, 130, 246, 0.4) !important;
        background-color: rgba(59, 130, 246, 0.03) !important;
      }
      .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        border-radius: 4px;
      }
      .swagger-ui .opblock.opblock-get .opblock-summary-path {
        color: #c9d1d9 !important;
      }

      /* Schemas Accordion Box Wrapper */
      .swagger-ui section.models {
        border: 1px solid #30363d !important;
        border-radius: 6px !important;
        background-color: #161b22 !important;
      }
      .swagger-ui section.models h4 {
        color: #f0f6fc !important;
        border-bottom: 1px solid #21262d !important;
      }
      .swagger-ui .model-box {
        background-color: #0d1117 !important;
        border: 1px solid #21262d !important;
        border-radius: 4px;
        margin: 8px 0 !important;
        padding: 10px !important;
      }
      .swagger-ui .model-title {
        color: #c9d1d9 !important;
      }
      .swagger-ui .model {
        color: #8b949e !important;
      }
      .swagger-ui .expand-schema {
        color: #10b981 !important;
      }
    `,
  };

  app.get("/api/v1/docs.json", (_req, res) => {
    res.json(document);
  });

  app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(document, swaggerOptions),
  );
}
