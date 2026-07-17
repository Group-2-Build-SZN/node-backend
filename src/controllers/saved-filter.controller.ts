import savedFilterService from "@/services/saved-filter.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class SavedFilterController {
  static async create(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await savedFilterService.create(userId, req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await savedFilterService.list(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async remove(req: Request, res: Response) {
    const userId = req.user!.id;
    await savedFilterService.delete(userId, req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Saved filter removed" });
  }
}

export default SavedFilterController;
