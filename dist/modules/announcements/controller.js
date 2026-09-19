"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class AnnouncementController {
    static async getAllAnnouncements(req, res) {
        try {
            const { status } = req.query;
            const data = await service_js_1.AnnouncementService.getAllAnnouncements(status ? String(status) : undefined);
            (0, response_js_1.sendSuccess)(res, data, "Announcements fetched successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch announcements", 500);
        }
    }
    static async createAnnouncement(req, res) {
        try {
            const authorUserId = req.user?.userId;
            if (!authorUserId)
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            const data = await service_js_1.AnnouncementService.createAnnouncement(req.body, authorUserId);
            (0, response_js_1.sendSuccess)(res, data, "Announcement published successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to publish announcement", 400);
        }
    }
    static async updateAnnouncement(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.AnnouncementService.updateAnnouncement(id, req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Announcement updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update announcement", 400);
        }
    }
    static async deleteAnnouncement(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.AnnouncementService.deleteAnnouncement(id, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Announcement removed");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to remove announcement", 400);
        }
    }
}
exports.AnnouncementController = AnnouncementController;
