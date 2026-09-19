"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class LedgerController {
    static async getAllLedgers(req, res, next) {
        try {
            const { year, search, page, limit } = req.query;
            const result = await service_js_1.LedgerService.getAllLedgers({
                year: year ? parseInt(String(year), 10) : undefined,
                search: search ? String(search) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, result.items, "Ledger records fetched", 200, result.meta);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch ledger", 500);
        }
    }
    static async getUserLedger(req, res, next) {
        try {
            let userId = parseInt(req.params.userId, 10);
            if (req.user?.role === "USER") {
                userId = req.user.userId;
            }
            if (isNaN(userId))
                return (0, response_js_1.sendError)(res, "Invalid user ID", 400);
            const { year } = req.query;
            const ledger = await service_js_1.LedgerService.getUserLedger(userId, year ? parseInt(String(year), 10) : undefined);
            (0, response_js_1.sendSuccess)(res, ledger, "User ledger statement");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch user ledger", 404);
        }
    }
}
exports.LedgerController = LedgerController;
