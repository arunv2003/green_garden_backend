"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class ExpenseController {
    static async getAllExpenses(req, res) {
        try {
            const { category, search, page, limit } = req.query;
            const data = await service_js_1.ExpenseService.getAllExpenses({
                category: category ? String(category) : undefined,
                search: search ? String(search) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, data.items, "Expenses fetched successfully", 200, { ...data.meta, summary: data.summary });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch expenses", 500);
        }
    }
    static async createExpense(req, res) {
        try {
            const authorUserId = req.user?.userId;
            if (!authorUserId)
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            const data = await service_js_1.ExpenseService.createExpense(req.body, authorUserId);
            (0, response_js_1.sendSuccess)(res, data, "Expense recorded successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to record expense", 400);
        }
    }
    static async updateExpense(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.ExpenseService.updateExpense(id, req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Expense updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update expense", 400);
        }
    }
    static async deleteExpense(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.ExpenseService.deleteExpense(id, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Expense removed successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to remove expense", 400);
        }
    }
}
exports.ExpenseController = ExpenseController;
