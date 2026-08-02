import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import landlordStatsService from "@/services/landlord-stats.service";
import type { GetRecentInquiriesQuery } from "@/validations/landlord-stats.validation";

class LandlordStatsController {
  static async getStats(req: Request, res: Response) {
    const ownerId = req.user!.id;
    const data = await landlordStatsService.getStats(ownerId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getRecentInquiries(req: Request, res: Response) {
    const ownerId = req.user!.id;
    const { page, limit } = req.validatedQuery as GetRecentInquiriesQuery;
    const result = await landlordStatsService.getRecentInquiries(
      ownerId,
      page,
      limit,
    );
    return res.status(StatusCodes.OK).json({ success: true, ...result });
  }
}

export default LandlordStatsController;
