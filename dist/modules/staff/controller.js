"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class StaffController {
    static async getStaff(req, res) {
        try {
            const { search, role, page, limit } = req.query;
            const data = await service_js_1.StaffService.getStaffOverview({
                search: search ? String(search) : undefined,
                role: role ? String(role) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, data, "Staff members fetched successfully", 200, data.pagination);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch staff members", 500);
        }
    }
    static async createAccountant(req, res) {
        try {
            const creatorId = req.user?.userId;
            const data = await service_js_1.StaffService.createAccountant(req.body, creatorId);
            (0, response_js_1.sendSuccess)(res, data, "Accountant created successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to create accountant", 400);
        }
    }
    static async updateAccountant(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid accountant ID", 400);
            const updaterId = req.user?.userId;
            const data = await service_js_1.StaffService.updateAccountant(id, req.body, updaterId);
            (0, response_js_1.sendSuccess)(res, data, "Accountant updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update accountant", 400);
        }
    }
    static async changeSecretary(req, res) {
        try {
            const operatorId = req.user?.userId;
            const paramId = req.params.id ? parseInt(req.params.id, 10) : undefined;
            const payload = paramId && !isNaN(paramId) ? { ...req.body, id: paramId } : req.body;
            const data = await service_js_1.StaffService.changeSecretary(payload, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Secretary updated / changed successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update secretary", 400);
        }
    }
    static async deleteStaff(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid staff ID", 400);
            const operatorId = req.user?.userId;
            if (!operatorId) {
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            }
            const data = await service_js_1.StaffService.deleteStaff(id, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Staff member deactivated");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to deactivate staff member", 400);
        }
    }
}
exports.StaffController = StaffController;
