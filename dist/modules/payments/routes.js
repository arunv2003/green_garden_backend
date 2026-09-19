"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Regular users can view their own payments, Accountant/Secretary can view all
router.get("/", auth_js_1.authenticateUser, controller_js_1.PaymentController.getAllPayments);
router.get("/:id", auth_js_1.authenticateUser, controller_js_1.PaymentController.getPaymentById);
router.get("/:id/receipt", auth_js_1.authenticateUser, controller_js_1.PaymentController.getReceipt);
// ACCOUNTANT and SECRETARY can record, edit, or delete payments
router.post("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createPaymentSchema), controller_js_1.PaymentController.createPayment);
router.put("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.PaymentController.updatePayment);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.PaymentController.deletePayment);
exports.default = router;
