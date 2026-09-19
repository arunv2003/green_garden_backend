"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class VisitorController {
    static async getAllVisitors(req, res) {
        try {
            const { search, flatId, status, date, page, limit } = req.query;
            const data = await service_js_1.VisitorService.getAllVisitors({
                search: search ? String(search) : undefined,
                flatId: flatId ? parseInt(String(flatId), 10) : undefined,
                status: status ? String(status) : undefined,
                date: date ? String(date) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, data.items, "Visitors fetched successfully", 200, { ...data.meta, summary: data.summary });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch visitors", 500);
        }
    }
    static async getInsideVisitors(req, res) {
        try {
            const data = await service_js_1.VisitorService.getInsideVisitors();
            (0, response_js_1.sendSuccess)(res, data, "Currently inside visitors");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch inside visitors", 500);
        }
    }
    static async logVisitorEntry(req, res) {
        try {
            const operatorId = req.user?.userId;
            const data = await service_js_1.VisitorService.logVisitorEntry(req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Visitor entry logged successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to log visitor", 400);
        }
    }
    static async recordVisitorExit(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid visitor ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.VisitorService.recordVisitorExit(id, req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Visitor exit recorded successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to record visitor exit", 400);
        }
    }
    static async updateVisitor(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid visitor ID", 400);
            const data = await service_js_1.VisitorService.updateVisitor(id, req.body);
            (0, response_js_1.sendSuccess)(res, data, "Visitor updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update visitor", 400);
        }
    }
    static async deleteVisitor(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid visitor ID", 400);
            const data = await service_js_1.VisitorService.deleteVisitor(id);
            (0, response_js_1.sendSuccess)(res, data, "Visitor deleted successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete visitor", 400);
        }
    }
}
exports.VisitorController = VisitorController;
