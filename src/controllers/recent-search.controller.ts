import recentSearchService from "@/services/recent-search.service";
import type { GetRecentSearchesQuery } from "@/validations/recent-search.validation";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class RecentSearchController {
  static async recordSearch(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await recentSearchService.recordSearch(userId, req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async getRecentSearches(req: Request, res: Response) {
    const userId = req.user!.id;
    const { limit } = req.validatedQuery as GetRecentSearchesQuery;
    const data = await recentSearchService.getRecentSearches(userId, limit);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async clearRecentSearches(req: Request, res: Response) {
    const userId = req.user!.id;
    await recentSearchService.clearRecentSearches(userId);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Recent searches cleared" });
  }
}

export default RecentSearchController;
