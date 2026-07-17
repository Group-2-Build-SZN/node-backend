import argon2 from "argon2";
import { env } from "@/config/env.config";
import { db } from "@/config/database.config";
import { loginCodes } from "@/db/schema";
import { addMinutes } from "date-fns";
import emailService from "@/services/email.service";

class AuthService {
    async requestCode(email: string) {
        const otpLength = env.OTP_CODE_LENGTH;

        const min = Math.pow(10, otpLength - 1);
        const max = Math.pow(10, otpLength) - 1;

        const otp = Math.floor(Math.random() * (max - min + 1)) + min;

        const codeHash = await argon2.hash(otp.toString());

        const expiresAt = addMinutes(new Date(), env.OTP_EXPIRY_MINUTES);

        await db.insert(loginCodes).values({
            email,
            codeHash,
            expiresAt,
        });

        await emailService.sendLoginCode(email, otp.toString());

        return {
            message: "Login code sent successfully.",
        };
    }
}

export default new AuthService();