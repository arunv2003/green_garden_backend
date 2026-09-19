"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Accountant & Secretary can view and manage expenses
router.get("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.ExpenseController.getAllExpenses);
router.post("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createExpenseSchema), controller_js_1.ExpenseController.createExpense);
router.put("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.ExpenseController.updateExpense);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.ExpenseController.deleteExpense);
exports.default = router;
