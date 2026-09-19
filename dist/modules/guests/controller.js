"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class GuestController {
    static async getAllGuests(req, res, next) {
        try {
            const { search, status, role, page, limit } = req.query;
            const result = await service_js_1.GuestService.getAllGuests({
                search: search ? String(search) : undefined,
                status: status ? String(status) : undefined,
                role: role ? String(role) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, result.items, "Guests fetched successfully", 200, result.meta);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch guests", 500);
        }
    }
    static async getGuestById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid guest ID", 400);
            // If user role, ensure they can only view their own profile
            if (req.user?.role === "USER" && req.user.userId !== id) {
                return (0, response_js_1.sendError)(res, "Access denied. You can only view your own profile.", 403);
            }
            const guest = await service_js_1.GuestService.getGuestById(id);
            (0, response_js_1.sendSuccess)(res, guest, "Guest profile details");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch guest", 404);
        }
    }
    static async createGuest(req, res, next) {
        try {
            const result = await service_js_1.GuestService.createGuest(req.body);
            (0, response_js_1.sendSuccess)(res, result, "Guest created successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to create guest", 400);
        }
    }
    static async updateGuest(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid guest ID", 400);
            const updated = await service_js_1.GuestService.updateGuest(id, req.body);
            (0, response_js_1.sendSuccess)(res, updated, "Guest updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update guest", 400);
        }
    }
    static async deleteGuest(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid guest ID", 400);
            const result = await service_js_1.GuestService.deleteGuest(id);
            (0, response_js_1.sendSuccess)(res, result, "Guest deleted successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete guest", 400);
        }
    }
}
exports.GuestController = GuestController;
