import argon2 from "argon2";
import { env } from "@/config/env.config";
import { db } from "@/config/database.config";
import { addMinutes, addDays } from "date-fns";
import emailService from "@/services/email.service";
import { eq, and, desc, gt, isNull } from "drizzle-orm";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "@/constants/user-role";
import { loginCodes, users, refreshTokens } from "@/db/schema";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, } from "@/utils/jwt";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

class AuthService {
    private async createSession(user: typeof users.$inferSelect) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role as UserRole | null,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const refreshTokenHash = await argon2.hash(refreshToken);

        await db.insert(refreshTokens).values({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: addDays(new Date(), 7),
        });

        const isProfileComplete = Boolean(
            user.firstName &&
            user.lastName &&
            user.phone &&
            user.role,
        );

        return {
            accessToken,
            refreshToken,
            user,
            isProfileComplete,
        };
    }

    private async findOrCreateGoogleUser(email: string, googleId: string) {
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
                    googleId,
                    role: null,
                })
                .returning();
        } else if (!user.googleId) {
            [user] = await db
                .update(users)
                .set({
                    googleId,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id))
                .returning();
        }

        return user;
    }

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

        return this.createSession(user);
    
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw AppError(
                "Refresh token is required.",
                StatusCodes.UNAUTHORIZED,
                ErrorCode.UNAUTHORIZED,
            );
        }

        const payload = verifyRefreshToken(refreshToken);

        const tokens = await db
            .select()
            .from(refreshTokens)
            .where(
                and(
                    eq(refreshTokens.userId, payload.userId),
                    isNull(refreshTokens.revokedAt),
                    gt(refreshTokens.expiresAt, new Date()),
                ),
            );

        let matchedToken: typeof tokens[number] | undefined;

        for (const token of tokens) {
            const matches = await argon2.verify(token.tokenHash, refreshToken);

            if (matches) {
                matchedToken = token;
                break;
            }
        }

        if (!matchedToken) {
            throw AppError(
                "Invalid refresh token.",
                StatusCodes.UNAUTHORIZED,
                ErrorCode.UNAUTHORIZED,
            );
        }

        await db
            .update(refreshTokens)
            .set({
                revokedAt: new Date(),
            })
            .where(eq(refreshTokens.id, matchedToken.id));

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, payload.userId))
            .limit(1);

        if (!user) {
            throw AppError(
                "User not found.",
                StatusCodes.UNAUTHORIZED,
                ErrorCode.UNAUTHORIZED,
            );
        }

        if (user.isBlacklisted) {
            throw AppError(
                "Your account has been blacklisted.",
                StatusCodes.FORBIDDEN,
                ErrorCode.FORBIDDEN,
            );
        }

        const newPayload = {
            userId: user.id,
            email: user.email,
            role: user.role as UserRole | null,
        };

        const newAccessToken = generateAccessToken(newPayload);
        const newRefreshToken = generateRefreshToken(newPayload);

        const newRefreshTokenHash = await argon2.hash(newRefreshToken);

        await db.insert(refreshTokens).values({
            userId: user.id,
            tokenHash: newRefreshTokenHash,
            expiresAt: addDays(new Date(), 7),
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(refreshToken: string) {
        if (!refreshToken) {
            return;
        }

        try {
            const payload = verifyRefreshToken(refreshToken);

            const tokens = await db
                .select()
                .from(refreshTokens)
                .where(
                    and(
                        eq(refreshTokens.userId, payload.userId),
                        isNull(refreshTokens.revokedAt),
                    ),
                );

            for (const token of tokens) {
                const matches = await argon2.verify(
                    token.tokenHash,
                    refreshToken,
                );

                if (matches) {
                    await db
                        .update(refreshTokens)
                        .set({
                            revokedAt: new Date(),
                        })
                        .where(eq(refreshTokens.id, token.id));

                    break;
                }
            }
        } catch {
            return;
        }
    }

    async completeProfile(
        userId: string,
        data: {
            firstName: string;
            lastName: string;
            phone: string;
            role: UserRole;
        },
    ) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            throw AppError(
                "User not found.",
                StatusCodes.NOT_FOUND,
                ErrorCode.RESOURCE_NOT_FOUND,
            );
        }

        if (user.role !== null) {
            throw AppError(
                "Profile has already been completed.",
                StatusCodes.BAD_REQUEST,
                ErrorCode.INVALID_INPUT,
            );
        }

        const [existingPhone] = await db
            .select()
            .from(users)
            .where(eq(users.phone, data.phone))
            .limit(1);

        if (existingPhone && existingPhone.id !== user.id) {
            throw AppError(
                "Phone number already exists.",
                StatusCodes.CONFLICT,
                ErrorCode.DUPLICATE_ENTRY,
            );
        }

        const [updatedUser] = await db
            .update(users)
            .set({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id))
            .returning();

        return updatedUser;
    }

    async googleLogin(idToken: string) {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload?.email || !payload.sub) {
            throw AppError(
                "Invalid Google token.",
                StatusCodes.UNAUTHORIZED,
                ErrorCode.UNAUTHORIZED,
            );
        }

        const user = await this.findOrCreateGoogleUser(
            payload.email,
            payload.sub,
        );

        if (user.isBlacklisted) {
            throw AppError(
                "Your account has been blacklisted.",
                StatusCodes.FORBIDDEN,
                ErrorCode.FORBIDDEN,
            );
        }

        return this.createSession(user);
    }
}



export default new AuthService();