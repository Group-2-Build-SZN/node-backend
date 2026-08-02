import { Router } from "express";
import LandlordStatsController from "@/controllers/landlord-stats.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { getRecentInquiriesQuerySchema } from "@/validations/landlord-stats.validation";

const router = Router();

router.get("/stats", authenticate, LandlordStatsController.getStats);
router.get(
  "/inquiries/recent",
  authenticate,
  validateSchema(getRecentInquiriesQuerySchema, "query"),
  LandlordStatsController.getRecentInquiries,
);

export default router;
