import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";

export const validateSchema = (
  schema: ZodTypeAny,
  reqType: "query" | "body" = "body",
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dataToValidate = reqType === "body" ? req.body : req.query;
      const parsed = await schema.parseAsync(dataToValidate);

      if (reqType === "body") {
        req.body = parsed;
      } else {
        req.validatedQuery = parsed;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          success: false,
          errors: err.issues.reduce<Record<string, string>>((acc, issue) => {
            acc[issue.path.join(".") || "error"] = issue.message;
            return acc;
          }, {}),
        });
        return;
      }
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ success: false, error: "Validation failed" });
    }
  };
};
