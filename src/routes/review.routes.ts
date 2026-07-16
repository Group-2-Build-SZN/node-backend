import ReviewController from "@/controllers/review.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { createReviewSchema } from "@/validations/review.validation";
import { Router } from "express";

const router = Router({ mergeParams: true });

router.get("/", ReviewController.getPropertyReviews);
router.post(
  "/",
  authenticate,
  validateSchema(createReviewSchema, "body"),
  ReviewController.submitReview,
);

export default router;
