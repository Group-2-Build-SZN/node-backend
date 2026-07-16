import amenityService from "@/services/amenity.service";
import type { GetAmenitiesQuery } from "@/validations/amenity.validation";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class AmenityController {
  static async getAmenities(req: Request, res: Response) {
    const data = await amenityService.getAmenities(
      req.validatedQuery as GetAmenitiesQuery,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default AmenityController;
