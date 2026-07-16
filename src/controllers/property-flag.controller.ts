import propertyFlagService from "@/services/property-flag.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class PropertyFlagController {
  static async flagProperty(req: Request, res: Response) {
    const flaggerId = req.user!.id;
    const propertyId = req.params.id as string;
    const data = await propertyFlagService.flagProperty(propertyId, flaggerId);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async unflagProperty(req: Request, res: Response) {
    const flaggerId = req.user!.id;
    const propertyId = req.params.id as string;
    await propertyFlagService.unflagProperty(propertyId, flaggerId);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Flag removed" });
  }
}

export default PropertyFlagController;
