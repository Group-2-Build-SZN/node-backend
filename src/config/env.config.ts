import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_PLAN_CODE: z.string().min(1, "PAYSTACK_PLAN_CODE is required"),

  DOJAH_APP_ID: z.string().min(1, "DOJAH App ID is required"),
  DOJAH_SECRET_KEY: z.string().min(1, "DOJAH SECRET KEY is required"),
  DOJAH_BASE_URL: z.string().url().default("https://sandbox.dojah.io"),

  EMAIL_HOST: z.string().min(1, "EMAIL_HOST is required"),
  EMAIL_PORT: z.coerce.number(),
  EMAIL_USER: z.string().min(1, "EMAIL_USER is required"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),

  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  OTP_CODE_LENGTH: z.coerce.number().default(6),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),

  SUPPORT_EMAIL: z.string().email(),

  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
