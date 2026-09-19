"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class PaymentController {
    static async getAllPayments(req, res, next) {
        try {
            const { userId, roomId, month, year, paymentMethod, status, search, page, limit } = req.query;
            let targetUserId = userId ? parseInt(String(userId), 10) : undefined;
            if (req.user?.role === "USER") {
                targetUserId = req.user.userId;
            }
            const result = await service_js_1.PaymentService.getAllPayments({
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
            (0, response_js_1.sendSuccess)(res, result.items, "Payments fetched successfully", 200, result.meta);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch payments", 500);
        }
    }
    static async getPaymentById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid payment ID", 400);
            const payment = await service_js_1.PaymentService.getPaymentById(id);
            if (req.user?.role === "USER" && payment.userId !== req.user.userId) {
                return (0, response_js_1.sendError)(res, "Access denied", 403);
            }
            (0, response_js_1.sendSuccess)(res, payment, "Payment details fetched");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch payment", 404);
        }
    }
    static async getReceipt(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid payment ID", 400);
            const receipt = await service_js_1.PaymentService.getReceipt(id);
            if (req.user?.role === "USER" && receipt.residentEmail && receipt.residentEmail !== req.user.email) {
                return (0, response_js_1.sendError)(res, "Access denied", 403);
            }
            (0, response_js_1.sendSuccess)(res, receipt, "Payment receipt generated");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to generate receipt", 404);
        }
    }
    static async createPayment(req, res, next) {
        try {
            if (!req.user)
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            const result = await service_js_1.PaymentService.createPayment(req.body, req.user.userId);
            (0, response_js_1.sendSuccess)(res, result, "Payment recorded successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to record payment", 400);
        }
    }
    static async updatePayment(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid payment ID", 400);
            const result = await service_js_1.PaymentService.updatePayment(id, req.body);
            (0, response_js_1.sendSuccess)(res, result, "Payment updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update payment", 400);
        }
    }
    static async deletePayment(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid payment ID", 400);
            const result = await service_js_1.PaymentService.deletePayment(id);
            (0, response_js_1.sendSuccess)(res, result, "Payment deleted successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete payment", 400);
        }
    }
}
exports.PaymentController = PaymentController;
