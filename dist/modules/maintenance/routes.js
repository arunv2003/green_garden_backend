"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Allow both /api/maintenance and /api/maintenance/bills
router.get("/", auth_js_1.authenticateUser, controller_js_1.MaintenanceController.getAllBills);
router.get("/bills", auth_js_1.authenticateUser, controller_js_1.MaintenanceController.getAllBills);
// Accountant & Secretary can generate bills or create/update bills
router.post("/generate", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.generateBillsSchema), controller_js_1.MaintenanceController.generateMonthlyBills);
router.post("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createSingleBillSchema), controller_js_1.MaintenanceController.createBill);
router.post("/bills", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createSingleBillSchema), controller_js_1.MaintenanceController.createBill);
router.get("/bills/:id", auth_js_1.authenticateUser, controller_js_1.MaintenanceController.getBillById);
router.get("/:id(\\d+)", auth_js_1.authenticateUser, controller_js_1.MaintenanceController.getBillById);
router.put("/bills/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.updateBillSchema), controller_js_1.MaintenanceController.updateBill);
router.put("/:id(\\d+)", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.updateBillSchema), controller_js_1.MaintenanceController.updateBill);
router.delete("/bills/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.MaintenanceController.deleteBill);
router.delete("/:id(\\d+)", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.MaintenanceController.deleteBill);
exports.default = router;
