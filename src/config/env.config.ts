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
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  PAYSTACK_SECRET_KEY: z.string().min(1),

  METAMAP_CLIENT_ID: z.string().min(1),
  METAMAP_CLIENT_SECRET: z.string().min(1),
  METAMAP_WEBHOOK_SECRET: z.string().min(1),
  METAMAP_WEBHOOK_URL: z.string().url("Must be a valid URL string"),

  //EMAIL_HOST: z.string().min(1, "EMAIL_HOST is required"),
  EMAIL_PORT: z.coerce.number(),
  //EMAIL_USER: z.string().min(1, "EMAIL_USER is required"),
  //EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),

  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  OTP_CODE_LENGTH: z.coerce.number().default(6),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
