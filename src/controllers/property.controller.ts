import propertyService from "@/services/property.service";
import { GetPropertiesQuery } from "@/validations/property.validation";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class PropertyController {
  static async createProperty(req: Request, res: Response) {
    const ownerId = req.user!.id;
    const data = await propertyService.createProperty(ownerId, req.body);
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async getProperties(req: Request, res: Response) {
    const data = await propertyService.getProperties(
      req.validatedQuery as GetPropertiesQuery,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getPropertyById(req: Request, res: Response) {
    const data = await propertyService.getPropertyById(req.params.id as string);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async updateProperty(req: Request, res: Response) {
    const ownerId = req.user!.id;
    const data = await propertyService.updateProperty(
      ownerId,
      req.params.id as string,
      req.body,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async publishProperty(req: Request, res: Response) {
    const ownerId = req.user!.id;
    const data = await propertyService.publishProperty(
      ownerId,
      req.params.id as string,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async deleteProperty(req: Request, res: Response) {
    const ownerId = req.user!.id;
    await propertyService.deleteProperty(ownerId, req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Property deleted successfully" });
  }
}

export default PropertyController;
