"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class DashboardController {
    static async getStats(req, res, next) {
        try {
            const userRole = req.user?.role;
            const userId = req.user?.userId;
            if (!userRole || !userId) {
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            }
            if (userRole === "SECRETARY") {
                const stats = await service_js_1.DashboardService.getSecretaryStats();
                return (0, response_js_1.sendSuccess)(res, { role: "SECRETARY", ...stats }, "Secretary dashboard stats");
            }
            if (userRole === "ACCOUNTANT") {
                const stats = await service_js_1.DashboardService.getAccountantStats();
                return (0, response_js_1.sendSuccess)(res, { role: "ACCOUNTANT", ...stats }, "Accountant dashboard stats");
            }
            // Default: regular USER
            const stats = await service_js_1.DashboardService.getUserStats(userId);
            return (0, response_js_1.sendSuccess)(res, { role: "USER", ...stats }, "User dashboard stats");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch dashboard statistics", 500);
        }
    }
}
exports.DashboardController = DashboardController;
