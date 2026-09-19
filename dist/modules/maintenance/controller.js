"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class MaintenanceController {
    static async getAllBills(req, res) {
        try {
            const { search, flatId, residentId, billingMonth, billingYear, status, page, limit } = req.query;
            const data = await service_js_1.MaintenanceService.getAllBills({
                search: search ? String(search) : undefined,
                flatId: flatId ? parseInt(String(flatId), 10) : undefined,
                residentId: residentId ? parseInt(String(residentId), 10) : undefined,
                billingMonth: (billingMonth || req.query.month) ? parseInt(String(billingMonth || req.query.month), 10) : undefined,
                billingYear: (billingYear || req.query.year) ? parseInt(String(billingYear || req.query.year), 10) : undefined,
                status: status ? String(status) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, data.items, "Maintenance bills fetched", 200, { ...data.meta, summary: data.summary });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch bills", 500);
        }
    }
    static async getBillById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid bill ID", 400);
            const data = await service_js_1.MaintenanceService.getBillById(id);
            (0, response_js_1.sendSuccess)(res, data, "Maintenance bill details");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Bill not found", 404);
        }
    }
    static async generateMonthlyBills(req, res) {
        try {
            const operatorId = req.user?.userId;
            const billingMonth = Number(req.body.billingMonth || req.body.month || new Date().getMonth() + 1);
            const billingYear = Number(req.body.billingYear || req.body.year || new Date().getFullYear());
            const data = await service_js_1.MaintenanceService.generateMonthlyBills({
                ...req.body,
                billingMonth,
                billingYear,
            }, operatorId);
            (0, response_js_1.sendSuccess)(res, data, `Monthly maintenance bills generated: ${data.generatedCount} generated, ${data.skippedCount} skipped`, 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to generate monthly bills", 400);
        }
    }
    static async createBill(req, res) {
        try {
            const operatorId = req.user?.userId;
            const data = await service_js_1.MaintenanceService.createBill(req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Maintenance bill created successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to create bill", 400);
        }
    }
    static async updateBill(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid bill ID", 400);
            const data = await service_js_1.MaintenanceService.updateBill(id, req.body);
            (0, response_js_1.sendSuccess)(res, data, "Maintenance bill updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update bill", 400);
        }
    }
    static async deleteBill(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid bill ID", 400);
            const data = await service_js_1.MaintenanceService.deleteBill(id);
            (0, response_js_1.sendSuccess)(res, data, "Maintenance bill deleted successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete bill", 400);
        }
    }
}
exports.MaintenanceController = MaintenanceController;
