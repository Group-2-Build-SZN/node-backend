import authService from "@/services/auth.service";
import { env } from "@/config/env.config";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function getRequestMeta(req: Request) {
  return {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  };
}

class AuthController {
  static async requestCode(req: Request, res: Response) {
    const data = await authService.requestCode(req.body);

    return res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  }

  static async verifyCode(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.verifyCode(
      req.body,
      getRequestMeta(req),
    );

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user,
        accessToken,
      },
    });
  }

  static async googleSignIn(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.googleSignIn(
      req.body,
      getRequestMeta(req),
    );

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user,
        accessToken,
      },
    });
  }

  static async completeProfile(req: Request, res: Response) {
    const userId = req.user!.id;

    const data = await authService.completeProfile(userId, req.body);

    return res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ success: false, message: "No refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refresh(refreshToken, getRequestMeta(req));

    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        accessToken,
      },
    });
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Logged out successfully.",
    });
  }
}

export default AuthController;
