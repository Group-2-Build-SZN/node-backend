import SavedPropertyController from "@/controllers/saved-property.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { Router } from "express";

const router = Router();

router.get("/", authenticate, SavedPropertyController.getSavedProperties);
router.get("/counts", authenticate, SavedPropertyController.getSavedCounts);

export default router;
