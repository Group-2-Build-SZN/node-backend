import UserController from "@/controllers/user.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { avatarUpload } from "@/middlewares/upload.middleware";
import { Router } from "express";
import { auth } from "google-auth-library";

const router = Router();

router.get("/:id/profile", UserController.getPublicProfile);
router.get("/me/stats", authenticate, UserController.getMyStats);
router.get("/me", authenticate, UserController.getMyProfile);
router.patch(
  "/me/avatar",
  authenticate,
  avatarUpload,
  UserController.updateAvatar,
);
router.delete("/me", authenticate, UserController.deleteAccount);

export default router;
