import UserController from "@/controllers/user.controller";
import RecentSearchController from "@/controllers/recent-search.controller";
import { authenticate } from "@/middlewares/authentication.middleware";
import { authRateLimiter } from "@/middlewares/rate-limiter.middleware";
import { validateSchema } from "@/middlewares/validation.middleware";
import { avatarUpload } from "@/middlewares/upload.middleware";
import {
  updateProfileSchema,
  updateAccountPreferencesSchema,
  updateNotificationPreferencesSchema,
  requestEmailChangeSchema,
  verifyEmailChangeSchema,
} from "@/validations/user.validation";
import {
  recordSearchSchema,
  getRecentSearchesQuerySchema,
} from "@/validations/recent-search.validation";
import { Router } from "express";

const router = Router();

router.get("/:id/profile", UserController.getPublicProfile);
router.get("/me/stats", authenticate, UserController.getMyStats);
router.get("/me/activity", authenticate, UserController.getMyActivity);
router.get("/me", authenticate, UserController.getMyProfile);

router.patch(
  "/me/avatar",
  authenticate,
  avatarUpload,
  UserController.updateAvatar,
);

// Settings > Profile
router.patch(
  "/me/profile",
  authenticate,
  validateSchema(updateProfileSchema, "body"),
  UserController.updateProfile,
);

// Settings > Account
router.patch(
  "/me/account",
  authenticate,
  validateSchema(updateAccountPreferencesSchema, "body"),
  UserController.updateAccountPreferences,
);

// Settings > Notifications
router.get(
  "/me/notification-preferences",
  authenticate,
  UserController.getNotificationPreferences,
);
router.patch(
  "/me/notification-preferences",
  authenticate,
  validateSchema(updateNotificationPreferencesSchema, "body"),
  UserController.updateNotificationPreferences,
);

// Settings > Security -- email change (two-step OTP verification)
router.post(
  "/me/email/request-change",
  authenticate,
  authRateLimiter,
  validateSchema(requestEmailChangeSchema, "body"),
  UserController.requestEmailChange,
);
router.post(
  "/me/email/verify-change",
  authenticate,
  validateSchema(verifyEmailChangeSchema, "body"),
  UserController.verifyEmailChange,
);

// Recent searches (dashboard stat)
router.post(
  "/me/recent-searches",
  authenticate,
  validateSchema(recordSearchSchema, "body"),
  RecentSearchController.recordSearch,
);
router.get(
  "/me/recent-searches",
  authenticate,
  validateSchema(getRecentSearchesQuerySchema, "query"),
  RecentSearchController.getRecentSearches,
);
router.delete(
  "/me/recent-searches",
  authenticate,
  RecentSearchController.clearRecentSearches,
);

router.delete("/me", authenticate, UserController.deleteAccount);

export default router;
