import { eq, and, desc } from "drizzle-orm";
import { db } from "@/config/database.config";
import { savedFilters } from "@/db/schema/saved-filters.schema";
import AppError from "@/errors/AppError";
import { ErrorCode } from "@/constants/error-code";
import { StatusCodes } from "http-status-codes";
import type { CreateSavedFilterInput } from "@/validations/saved-filter.validation";

class SavedFilterService {
  async create(userId: string, payload: CreateSavedFilterInput) {
    const [filter] = await db
      .insert(savedFilters)
      .values({ userId, name: payload.name, filters: payload.filters })
      .returning();
    return filter;
  }

  async list(userId: string) {
    return db
      .select()
      .from(savedFilters)
      .where(eq(savedFilters.userId, userId))
      .orderBy(desc(savedFilters.createdAt));
  }

  async delete(userId: string, id: string) {
    const [deleted] = await db
      .delete(savedFilters)
      .where(and(eq(savedFilters.id, id), eq(savedFilters.userId, userId)))
      .returning();

    if (!deleted) {
      throw AppError(
        "Saved filter not found",
        StatusCodes.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return true;
  }
}

export default new SavedFilterService();
