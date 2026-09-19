import { Request, Response } from "express";
import { ExpenseService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class ExpenseController {
  static async getAllExpenses(req: Request, res: Response) {
    try {
      const { category, search, page, limit } = req.query;
      const data = await ExpenseService.getAllExpenses({
        category: category ? String(category) : undefined,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, data.items, "Expenses fetched successfully", 200, { ...data.meta, summary: data.summary });
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch expenses", 500);
    }
  }

  static async createExpense(req: Request, res: Response) {
    try {
      const authorUserId = req.user?.userId;
      if (!authorUserId) return sendError(res, "Unauthorized", 401);
      const data = await ExpenseService.createExpense(req.body, authorUserId);
      sendSuccess(res, data, "Expense recorded successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to record expense", 400);
    }
  }

  static async updateExpense(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid ID", 400);
      const operatorId = req.user?.userId;
      const data = await ExpenseService.updateExpense(id, req.body, operatorId);
      sendSuccess(res, data, "Expense updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update expense", 400);
    }
  }

  static async deleteExpense(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid ID", 400);
      const operatorId = req.user?.userId;
      const data = await ExpenseService.deleteExpense(id, operatorId);
      sendSuccess(res, data, "Expense removed successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to remove expense", 400);
    }
  }
}
