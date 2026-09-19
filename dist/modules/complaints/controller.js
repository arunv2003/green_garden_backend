"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class ComplaintController {
    static async getAllComplaints(req, res) {
        try {
            const { category, priority, status, flatId, createdBy, search, page, limit } = req.query;
            // If user is resident, default to showing their complaints unless secretary
            let filterCreatedBy = createdBy ? parseInt(String(createdBy), 10) : undefined;
            if (req.user?.role === "USER") {
                filterCreatedBy = req.user.userId;
            }
            const data = await service_js_1.ComplaintService.getAllComplaints({
                category: category ? String(category) : undefined,
                priority: priority ? String(priority) : undefined,
                status: status ? String(status) : undefined,
                flatId: flatId ? parseInt(String(flatId), 10) : undefined,
                createdBy: filterCreatedBy,
                search: search ? String(search) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, data.items, "Complaints fetched successfully", 200, { ...data.meta, summary: data.summary });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch complaints", 500);
        }
    }
    static async getComplaintById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid complaint ID", 400);
            const data = await service_js_1.ComplaintService.getComplaintById(id);
            (0, response_js_1.sendSuccess)(res, data, "Complaint details");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Complaint not found", 404);
        }
    }
    static async createComplaint(req, res) {
        try {
            const creatorUserId = req.user?.userId;
            if (!creatorUserId)
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            const data = await service_js_1.ComplaintService.createComplaint(req.body, creatorUserId);
            (0, response_js_1.sendSuccess)(res, data, "Complaint filed successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to file complaint", 400);
        }
    }
    static async updateComplaintStatus(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid complaint ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.ComplaintService.updateComplaintStatus(id, req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Complaint status updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update complaint", 400);
        }
    }
    static async updateComplaint(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid complaint ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.ComplaintService.updateComplaint(id, req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Complaint updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update complaint", 400);
        }
    }
    static async deleteComplaint(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid complaint ID", 400);
            const data = await service_js_1.ComplaintService.deleteComplaint(id);
            (0, response_js_1.sendSuccess)(res, data, "Complaint deleted successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete complaint", 400);
        }
    }
}
exports.ComplaintController = ComplaintController;
