import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { sendError } from "../utils/response.js";

export const validateBody = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        sendError(res, `Validation error: ${errorMessages}`, 400, error.errors);
        return;
      }
      sendError(res, "Invalid request data", 400);
    }
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        sendError(res, `Validation error: ${errorMessages}`, 400, error.errors);
        return;
      }
      sendError(res, "Invalid query parameters", 400);
    }
  };
};
