"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const router = (0, express_1.Router)();
// Accountant and Secretary can view all ledgers
router.get("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("ACCOUNTANT", "SECRETARY"), controller_js_1.LedgerController.getAllLedgers);
// Guests can view their own ledger; Accountant/Secretary can view any
router.get("/:userId", auth_js_1.authenticateUser, controller_js_1.LedgerController.getUserLedger);
exports.default = router;
