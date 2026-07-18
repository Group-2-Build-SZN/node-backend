import propertyReportService from "@/services/property-report.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class PropertyReportController {
  static async submitReport(req: Request, res: Response) {
    const reporterId = req.user!.id;
    const propertyId = req.params.id as string;
    const files = (req.files as Express.Multer.File[]) ?? [];
    const data = await propertyReportService.submitReport(
      propertyId,
      reporterId,
      req.body,
      files,
    );
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }
}

export default PropertyReportController;
