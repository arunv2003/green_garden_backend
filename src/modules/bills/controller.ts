import { Request, Response, NextFunction } from "express";
import { BillService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class BillController {
  static async getAllBills(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year, status, userId, roomId } = req.query;

      // If regular user, restrict to their own bills
      let targetUserId = userId ? parseInt(String(userId), 10) : undefined;
      if (req.user?.role === "USER") {
        targetUserId = req.user.userId;
      }

      const bills = await BillService.getAllBills({
        month: month ? parseInt(String(month), 10) : undefined,
        year: year ? parseInt(String(year), 10) : undefined,
        status: status ? String(status) : undefined,
        userId: targetUserId,
        roomId: roomId ? parseInt(String(roomId), 10) : undefined,
      });
      sendSuccess(res, bills, "Bills fetched successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch bills", 500);
    }
  }

  static async getBillById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid bill ID", 400);

      const bill = await BillService.getBillById(id);
      if (req.user?.role === "USER" && bill.userId !== req.user.userId) {
        return sendError(res, "Access denied", 403);
      }

      sendSuccess(res, bill, "Bill details fetched");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch bill", 404);
    }
  }

  static async generateMonthlyBills(req: Request, res: Response, next: NextFunction) {
    try {
      const { billingMonth, billingYear, dueDate } = req.body;
      const result = await BillService.generateMonthlyBills(
        billingMonth,
        billingYear,
        dueDate
      );
      sendSuccess(res, result, result.message, 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to generate monthly bills", 400);
    }
  }
}
