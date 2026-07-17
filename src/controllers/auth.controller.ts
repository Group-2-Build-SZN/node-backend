import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "@/services/auth.service";

class AuthController {
    static async requestCode(req: Request, res: Response) {
        const { email } = req.body;

        await authService.requestCode(email);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Login code sent successfully.",
        });
    }
}

export default AuthController;