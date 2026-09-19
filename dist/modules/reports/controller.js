"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class ReportController {
    static async getMonthlyCollection(req, res, next) {
        try {
            const year = req.query.year ? parseInt(String(req.query.year), 10) : undefined;
            const report = await service_js_1.ReportService.getMonthlyCollection(year);
            (0, response_js_1.sendSuccess)(res, report, "Monthly collection report");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to generate monthly collection report", 500);
        }
    }
    static async getRoomRevenue(req, res, next) {
        try {
            const report = await service_js_1.ReportService.getRoomRevenue();
            (0, response_js_1.sendSuccess)(res, report, "Room revenue report");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to generate room revenue report", 500);
        }
    }
    static async getGuestLedger(req, res, next) {
        try {
            const report = await service_js_1.ReportService.getGuestLedgerReport();
            (0, response_js_1.sendSuccess)(res, report, "Guest ledger report");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to generate guest ledger report", 500);
        }
    }
    static async exportCsv(req, res, next) {
        try {
            const type = req.query.type || "monthly";
            const year = req.query.year ? parseInt(String(req.query.year), 10) : undefined;
            const csv = await service_js_1.ReportService.exportReportCsv(type, year);
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename=green_garden_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
            res.status(200).send(csv);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to export CSV", 500);
        }
    }
}
exports.ReportController = ReportController;
