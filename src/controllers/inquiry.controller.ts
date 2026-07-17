import inquiryService from "@/services/inquiry.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class InquiryController {
  static async submitInquiry(req: Request, res: Response) {
    const tenantId = req.user!.id;
    const propertyId = req.params.id as string;
    const data = await inquiryService.submitInquiry(
      propertyId,
      tenantId,
      req.body,
    );
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async getMyInquiries(req: Request, res: Response) {
    const tenantId = req.user!.id;
    const data = await inquiryService.getMyInquiries(tenantId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default InquiryController;
