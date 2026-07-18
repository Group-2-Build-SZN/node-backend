import ReviewController from "@/controllers/review.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import {
  createReviewSchema,
  getReviewsQuerySchenma,
} from "@/validations/review.validation";
import { reviewPhotoUpload } from "@/middlewares/upload.middleware";
import { Router } from "express";

const router = Router({ mergeParams: true });

router.get(
  "/",
  validateSchema(getReviewsQuerySchenma, "query"),
  ReviewController.getPropertyReviews,
);

router.post(
  "/",
  authenticate,
  validateSchema(createReviewSchema, "body"),
  ReviewController.submitReview,
);
router.post(
  "/",
  authenticate,
  reviewPhotoUpload,
  validateSchema(createReviewSchema, "body"),
  ReviewController.submitReview,
);

export default router;
