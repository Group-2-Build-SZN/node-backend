import referralService from "@/services/referral.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class ReferralController {
  static async getMyReferralStats(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await referralService.getReferralStats(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async applyCode(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await referralService.applyReferralCode(userId, req.body.code);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default ReferralController;
