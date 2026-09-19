import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "Authentication required. Please login.", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    sendError(res, "Invalid or expired token. Please login again.", 401);
  }
};

export const authorizeRole = (...roles: Array<"USER" | "SECRETARY" | "ACCOUNTANT">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required.", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Required role: [${roles.join(", ")}]. Current role: ${req.user.role}`,
        403
      );
      return;
    }

    next();
  };
};
