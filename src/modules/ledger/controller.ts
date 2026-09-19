import { Request, Response, NextFunction } from "express";
import { LedgerService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class LedgerController {
  static async getAllLedgers(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, search, page, limit } = req.query;
      const result = await LedgerService.getAllLedgers({
        year: year ? parseInt(String(year), 10) : undefined,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, result.items, "Ledger records fetched", 200, result.meta);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch ledger", 500);
    }
  }

  static async getUserLedger(req: Request, res: Response, next: NextFunction) {
    try {
      let userId = parseInt(req.params.userId, 10);
      if (req.user?.role === "USER") {
        userId = req.user.userId;
      }

      if (isNaN(userId)) return sendError(res, "Invalid user ID", 400);

      const { year } = req.query;
      const ledger = await LedgerService.getUserLedger(
        userId,
        year ? parseInt(String(year), 10) : undefined
      );

      sendSuccess(res, ledger, "User ledger statement");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch user ledger", 404);
    }
  }
}
