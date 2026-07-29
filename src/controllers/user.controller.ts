import userService from "@/services/user.service";
import userStatsService from "@/services/user-stats.service";
import notificationPreferenceService from "@/services/notification-preference.service";
import activityFeedService from "@/services/activity-feed.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class UserController {
  static async updateProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await userService.updateProfile(userId, req.body);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async updateAccountPreferences(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await userService.updateAccountPreferences(userId, req.body);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getNotificationPreferences(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await notificationPreferenceService.getPreferences(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async updateNotificationPreferences(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await notificationPreferenceService.updatePreferences(
      userId,
      req.body,
    );
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async requestEmailChange(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await userService.requestEmailChange(userId, req.body);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async verifyEmailChange(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await userService.verifyEmailChange(userId, req.body);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getMyActivity(req: Request, res: Response) {
    const userId = req.user!.id;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await activityFeedService.getActivityFeed(
      userId,
      page,
      limit,
    );
    return res.status(StatusCodes.OK).json({ success: true, ...result });
  }

  static async getPublicProfile(req: Request, res: Response) {
    const data = await userService.getPublicProfile(req.params.id as string);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getMyStats(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await userStatsService.getStats(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async getMyProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await userService.getMyProfile(userId);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async updateAvatar(req: Request, res: Response) {
    const userId = req.user!.id;
    const file = req.file as Express.Multer.File;
    const data = await userService.updateAvatar(userId, file);
    return res.status(StatusCodes.OK).json({ success: true, data });
  }

  static async deleteAccount(req: Request, res: Response) {
    const userId = req.user!.id;
    await userService.deleteAccount(userId);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Account deleted successfully" });
  }
}

export default UserController;
