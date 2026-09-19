"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const router = (0, express_1.Router)();
// Only Accountant and Secretary can access reports
router.get("/monthly", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.ReportController.getMonthlyCollection);
router.get("/room-revenue", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.ReportController.getRoomRevenue);
router.get("/guest-ledger", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.ReportController.getGuestLedger);
router.get("/export-csv", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.ReportController.exportCsv);
exports.default = router;
