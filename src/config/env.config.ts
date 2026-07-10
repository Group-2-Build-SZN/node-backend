import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  //   JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  //   JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),

  //   CLOUDINARY_CLOUD_NAME: z.string().min(1),
  //   CLOUDINARY_API_KEY: z.string().min(1),
  //   CLOUDINARY_API_SECRET: z.string().min(1),

  //   PAYSTACK_SECRET_KEY: z.string().min(1),
  //   PAYSTACK_WEBHOOK_SECRET: z.string().min(1),

  //   SMILE_ID_API_KEY: z.string().min(1),
  //   SMILE_ID_PARTNER_ID: z.string().min(1),

  //   EMAIL_HOST: z.string().optional(),
  //   EMAIL_PORT: z.coerce.number().optional(),
  //   EMAIL_USER: z.string().optional(),
  //   EMAIL_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
