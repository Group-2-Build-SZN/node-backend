import adminService from "@/services/admin.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class AdminController {
  static async listReports(req: Request, res: Response) {
    const propertyId = req.query.propertyId as string | undefined;
    const data = await adminService.listReports(propertyId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async updatePropertyStatus(req: Request, res: Response) {
    const propertyId = req.params.id as string;
    const data = await adminService.updatePropertyStatus(propertyId, req.body);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async listKycReviewNeeded(_req: Request, res: Response) {
    const data = await adminService.listKycReviewNeeded();
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async resolveKyc(req: Request, res: Response) {
    const verificationId = req.params.id as string;
    const data = await adminService.resolveKyc(verificationId, req.body);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async setBlacklistStatus(req: Request, res: Response) {
    const userId = req.params.id as string;
    const data = await adminService.setBlacklistStatus(userId, req.body);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default AdminController;
