import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "@/services/auth.service";

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

        return res.status(StatusCodes.OK).json({
            success: true,
            ...result,
        });
    }
}

export default AuthController;