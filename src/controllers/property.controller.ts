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
    const requestingUserId = req.user?.id;
    const result = await propertyService.getProperties(
      req.validatedQuery as GetPropertiesQuery,
      requestingUserId,
    );
    return res.status(StatusCodes.OK).json({ success: true, ...result });
  }

  static async getPropertyById(req: Request, res: Response) {
    const requestingUserId = req.user?.id;
    const data = await propertyService.getPropertyById(
      req.params.id as string,
      requestingUserId,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getRecommendedProperties(req: Request, res: Response) {
    const data = await propertyService.getRecommendedProperties();
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

  static async addMedia(req: Request, res: Response) {
    const ownerId = req.user!.id;
    const propertyId = req.params.id as string;
    const files = req.files as {
      photos?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    };
    const data = await propertyService.addMedia(
      ownerId,
      propertyId,
      files.photos ?? [],
      files.videos ?? [],
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default PropertyController;
