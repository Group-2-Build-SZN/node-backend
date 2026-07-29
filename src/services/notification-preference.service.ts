import { eq, and } from "drizzle-orm";
import { db } from "@/config/database.config";
import { notificationPreferences } from "@/db/schema/notification-preferences.schema";
import { notificationCategoryValues } from "@/validations/user.validation";
import type { UpdateNotificationPreferencesInput } from "@/validations/user.validation";

class NotificationPreferenceService {
  // Every category defaults to email+push ON until the user overrides it, so a
  // user who has never touched this screen gets a full list back, not an empty one.
  async getPreferences(userId: string) {
    const rows = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    const byCategory = new Map(rows.map((r) => [r.category, r]));

    return notificationCategoryValues.map((category) => {
      const existing = byCategory.get(category);
      return {
        category,
        emailEnabled: existing?.emailEnabled ?? true,
        pushEnabled: existing?.pushEnabled ?? true,
      };
    });
  }

  async updatePreferences(
    userId: string,
    payload: UpdateNotificationPreferencesInput,
  ) {
    for (const pref of payload.preferences) {
      const [existing] = await db
        .select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.userId, userId),
            eq(notificationPreferences.category, pref.category),
          ),
        );

      if (existing) {
        await db
          .update(notificationPreferences)
          .set({
            ...(pref.emailEnabled !== undefined && {
              emailEnabled: pref.emailEnabled,
            }),
            ...(pref.pushEnabled !== undefined && {
              pushEnabled: pref.pushEnabled,
            }),
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.id, existing.id));
      } else {
        await db.insert(notificationPreferences).values({
          userId,
          category: pref.category,
          emailEnabled: pref.emailEnabled ?? true,
          pushEnabled: pref.pushEnabled ?? true,
        });
      }
    }

    return this.getPreferences(userId);
  }
}

export default new NotificationPreferenceService();
