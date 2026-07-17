import SavedFilterController from "@/controllers/saved-filter.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { createSavedFilterSchema } from "@/validations/saved-filter.validation";
import { Router } from "express";

const router = Router();

router.get("/", authenticate, SavedFilterController.list);
router.post(
  "/",
  authenticate,
  validateSchema(createSavedFilterSchema, "body"),
  SavedFilterController.create,
);
router.delete("/:id", authenticate, SavedFilterController.remove);

export default router;
