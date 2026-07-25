import ReviewController from "@/controllers/review.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import {
  createReviewSchema,
  getReviewsQuerySchema,
  updateReviewSchema,
} from "@/validations/review.validation";
import { reviewPhotoUpload } from "@/middlewares/upload.middleware";
import { Router } from "express";

const router = Router({ mergeParams: true });

router.get(
  "/",
  validateSchema(getReviewsQuerySchema, "query"),
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

router.patch(
  "/:reviewId",
  authenticate,
  validateSchema(updateReviewSchema, "body"),
  ReviewController.updateReview,
);
router.delete("/:reviewId", authenticate, ReviewController.deleteReview);

export default router;
