"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StayController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class StayController {
    static async getAllStays(req, res, next) {
        try {
            const { status, userId, roomId, search, page, limit } = req.query;
            let targetUserId = userId ? parseInt(String(userId), 10) : undefined;
            if (req.user?.role === "USER") {
                targetUserId = req.user.userId;
            }
            const result = await service_js_1.StayService.getAllStays({
                status: status ? String(status) : undefined,
                userId: targetUserId,
                roomId: roomId ? parseInt(String(roomId), 10) : undefined,
                search: search ? String(search) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, result.items, "Stays fetched successfully", 200, result.meta);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch stays", 500);
        }
    }
    static async getStayById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid stay ID", 400);
            const stay = await service_js_1.StayService.getStayById(id);
            if (req.user?.role === "USER" && stay.userId !== req.user.userId) {
                return (0, response_js_1.sendError)(res, "Access denied. You can only view your own stay history.", 403);
            }
            (0, response_js_1.sendSuccess)(res, stay, "Stay details fetched");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch stay", 404);
        }
    }
    static async checkIn(req, res, next) {
        try {
            const result = await service_js_1.StayService.checkIn(req.body, req.user?.userId);
            (0, response_js_1.sendSuccess)(res, result, "Guest checked in successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Check-in failed", 400);
        }
    }
    static async checkOut(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid stay ID", 400);
            const result = await service_js_1.StayService.checkOut(id, req.body, req.user?.userId);
            (0, response_js_1.sendSuccess)(res, result, "Guest checked out successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Check-out failed", 400);
        }
    }
    static async updateStay(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid stay ID", 400);
            const result = await service_js_1.StayService.updateStay(id, req.body);
            (0, response_js_1.sendSuccess)(res, result, "Stay updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update stay", 400);
        }
    }
    static async deleteStay(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid stay ID", 400);
            const result = await service_js_1.StayService.deleteStay(id);
            (0, response_js_1.sendSuccess)(res, result, "Stay deleted successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete stay", 400);
        }
    }
}
exports.StayController = StayController;
