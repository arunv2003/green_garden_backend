"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Regular users can view their own bills, Secretary/Accountant can view all
router.get("/", auth_js_1.authenticateUser, controller_js_1.BillController.getAllBills);
router.get("/:id", auth_js_1.authenticateUser, controller_js_1.BillController.getBillById);
// Accountant and Secretary can generate monthly bills
router.post("/generate", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.generateBillsSchema), controller_js_1.BillController.generateMonthlyBills);
exports.default = router;
