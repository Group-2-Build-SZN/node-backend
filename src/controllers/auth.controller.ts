import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "@/services/auth.service";
import { env } from "@/config/env.config";

class AuthController {
    static async googleLogin(req: Request, res: Response) {
        const { idToken } = req.body;

        const result = await authService.googleLogin(idToken);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            accessToken: result.accessToken,
            user: result.user,
            isProfileComplete: result.isProfileComplete,
        });
    }

    static async requestCode(req: Request, res: Response) {
        const { email } = req.body;

        const result = await authService.requestCode(email);

        return res.status(StatusCodes.OK).json({
            success: true,
            ...result,
        });
    }

    static async verifyCode(req: Request, res: Response) {
        const { email, code } = req.body;

        const result = await authService.verifyCode(email, code);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            accessToken: result.accessToken,
            user: result.user,
        });
    }

    static async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;

        const result = await authService.refresh(refreshToken);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            accessToken: result.accessToken,
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
            user: result,
        });
    }

}

export default AuthController;