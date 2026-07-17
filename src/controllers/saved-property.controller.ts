import savedPropertyService from "@/services/saved-property.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class SavedPropertyController {
  static async saveProperty(req: Request, res: Response) {
    const userId = req.user!.id;
    const propertyId = req.params.id as string;
    const data = await savedPropertyService.saveProperty(userId, propertyId);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async unsaveProperty(req: Request, res: Response) {
    const userId = req.user!.id;
    const propertyId = req.params.id as string;
    await savedPropertyService.unsaveProperty(userId, propertyId);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Property removed from saved list" });
  }

  static async getSavedProperties(req: Request, res: Response) {
    const userId = req.user!.id;
    const listingPurpose = req.query.listingPurpose as
      "rent" | "sale" | undefined;
    const data = await savedPropertyService.getSavedProperties(
      userId,
      listingPurpose,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getSavedCounts(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await savedPropertyService.getSavedCounts(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default SavedPropertyController;
