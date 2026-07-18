import cors from "cors";
import { env } from "@/config/env.config";

const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((origin) =>
  origin.trim(),
);

export const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
});
