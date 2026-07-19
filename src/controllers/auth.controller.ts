import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "@/services/auth.service";
import { env } from "@/config/env.config";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
};

function getRequestMeta(req: Request) {
    return {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
    };
}

class AuthController {
    static async googleSignIn(req: Request, res: Response) {
        const { idToken } = req.body;

        const meta = getRequestMeta(req);

        const result = await authService.googleSignIn(idToken, meta);

        res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.status(StatusCodes.OK).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
                isProfileComplete: result.isProfileComplete,
            },
        });
    }

    static async requestCode(req: Request, res: Response) {
        const { email } = req.body;

        const result = await authService.requestCode(email);

        return res.status(StatusCodes.OK).json({
            success: true,
            data: result,
        });
    }

    static async verifyCode(req: Request, res: Response) {
        const { email, code } = req.body;

        const meta = getRequestMeta(req);

        const result = await authService.verifyCode(email, code, meta);

        res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.status(StatusCodes.OK).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    }

    static async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;

        const meta = getRequestMeta(req);

        const result = await authService.refresh(refreshToken, meta);

        res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.status(StatusCodes.OK).json({
            success: true,
            data: {
                accessToken: result.accessToken,
            },
        });
    }

    static async logout(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;

        await authService.logout(refreshToken);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Logged out successfully.",
        });
    }


    static async completeProfile(req: Request, res: Response) {
        const result = await authService.completeProfile(
            req.user!.id,
            req.body,
        );

        return res.status(StatusCodes.OK).json({
            success: true,
            data: {
                user: result,
            },
        });
    }

}

export default AuthController;
