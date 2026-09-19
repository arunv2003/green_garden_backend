import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      if (!userRole || !userId) {
        return sendError(res, "Unauthorized", 401);
      }

      if (userRole === "SECRETARY") {
        const stats = await DashboardService.getSecretaryStats();
        return sendSuccess(res, { role: "SECRETARY", ...stats }, "Secretary dashboard stats");
      }

      if (userRole === "ACCOUNTANT") {
        const stats = await DashboardService.getAccountantStats();
        return sendSuccess(res, { role: "ACCOUNTANT", ...stats }, "Accountant dashboard stats");
      }

      // Default: regular USER
      const stats = await DashboardService.getUserStats(userId);
      return sendSuccess(res, { role: "USER", ...stats }, "User dashboard stats");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch dashboard statistics", 500);
    }
  }
}
