import reviewService from "@/services/review.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class ReviewController {
  static async submitReview(req: Request, res: Response) {
    const reviewerId = req.user!.id;
    const propertyId = req.params.propertyId as string;
    const data = await reviewService.submitReview(
      reviewerId,
      propertyId,
      req.body,
    );
    return res.status(StatusCodes.CREATED).json({ success: true, data });
  }

  static async getPropertyReviews(req: Request, res: Response) {
    const propertyId = req.params.propertyId as string;
    const data = await reviewService.getPropertyReviews(propertyId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }
}

export default ReviewController;
