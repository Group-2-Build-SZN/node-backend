import argon2 from "argon2";
import { env } from "@/config/env.config";
import { db } from "@/config/database.config";
import { addMinutes, addDays } from "date-fns";
import emailService from "@/services/email.service";
import { eq, and, desc, gt } from "drizzle-orm";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "@/constants/user-role";
import { loginCodes, users, refreshTokens } from "@/db/schema";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";


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

    async verifyCode(email: string, code: string) {
        const [loginCode] = await db
            .select()
            .from(loginCodes)
            .where(
                and(
                    eq(loginCodes.email, email),
                    eq(loginCodes.consumed, false),
                    gt(loginCodes.expiresAt, new Date()),
                ),
            )
            .orderBy(desc(loginCodes.createdAt))
            .limit(1);
        
        if (!loginCode) {
            throw AppError(
                "Invalid or expired login code.",
                StatusCodes.BAD_REQUEST,
                ErrorCode.INVALID_INPUT,
            );
        }

        const isValid = await argon2.verify(loginCode.codeHash, code);

        if (!isValid) {
            throw AppError(
                "Invalid login code.",
                StatusCodes.BAD_REQUEST,
                ErrorCode.INVALID_INPUT,
            );
        }

        await db
            .update(loginCodes)
            .set({
                consumed: true,
            })
            .where(eq(loginCodes.id, loginCode.id));
        
        let [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        
        if (!user) {
            [user] = await db
                .insert(users)
                .values({
                    email,
                    role: null,
                })
                .returning();
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role as UserRole | null,
        };

        const accessToken = generateAccessToken(payload);

        const refreshToken = generateRefreshToken(payload);

        const refreshTokenHash = await argon2.hash(refreshToken);

        const refreshExpiresAt = addDays(new Date(), 7);

        await db.insert(refreshTokens).values({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: refreshExpiresAt,
        });

        return {
            accessToken,
            refreshToken,
            user,
        };
    }

    // async refresh(_refreshToken: string) {

    // }
}



export default new AuthService();