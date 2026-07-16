import kycService from "@/services/kyc.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class KycController {
  static async verifyNin(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await kycService.submitNinVerification(userId, req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async verifyCac(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await kycService.submitCacVerification(userId, req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async getStatus(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await kycService.getVerificationStatus(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default KycController;
