import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class PaymentController {
  static async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, roomId, month, year, paymentMethod, status, search, page, limit } = req.query;

      let targetUserId = userId ? parseInt(String(userId), 10) : undefined;
      if (req.user?.role === "USER") {
        targetUserId = req.user.userId;
      }

      const result = await PaymentService.getAllPayments({
        userId: targetUserId,
        roomId: roomId ? parseInt(String(roomId), 10) : undefined,
        month: month ? parseInt(String(month), 10) : undefined,
        year: year ? parseInt(String(year), 10) : undefined,
        paymentMethod: paymentMethod ? String(paymentMethod) : undefined,
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });

      sendSuccess(res, result.items, "Payments fetched successfully", 200, result.meta);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch payments", 500);
    }
  }

  static async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid payment ID", 400);

      const payment = await PaymentService.getPaymentById(id);
      if (req.user?.role === "USER" && payment.userId !== req.user.userId) {
        return sendError(res, "Access denied", 403);
      }

      sendSuccess(res, payment, "Payment details fetched");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch payment", 404);
    }
  }

  static async getReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid payment ID", 400);

      const receipt = await PaymentService.getReceipt(id);
      if (req.user?.role === "USER" && receipt.residentEmail && receipt.residentEmail !== req.user.email) {
        return sendError(res, "Access denied", 403);
      }

      sendSuccess(res, receipt, "Payment receipt generated");
    } catch (err: any) {
      sendError(res, err.message || "Failed to generate receipt", 404);
    }
  }

  static async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, "Unauthorized", 401);

      const result = await PaymentService.createPayment(req.body, req.user.userId);
      sendSuccess(res, result, "Payment recorded successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to record payment", 400);
    }
  }

  static async updatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid payment ID", 400);
      const result = await PaymentService.updatePayment(id, req.body);
      sendSuccess(res, result, "Payment updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update payment", 400);
    }
  }

  static async deletePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid payment ID", 400);
      const result = await PaymentService.deletePayment(id);
      sendSuccess(res, result, "Payment deleted successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete payment", 400);
    }
  }
}
