import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  sendError(res, message, statusCode, err.stack);
};
