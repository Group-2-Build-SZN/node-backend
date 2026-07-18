import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "@/services/auth.service";
import { env } from "@/config/env.config";

class AuthController {
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

    // static async refresh(_req: Request, _res: Response) {

    // }
}

export default AuthController;