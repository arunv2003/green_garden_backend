"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const router = (0, express_1.Router)();
// Endpoint adapts automatically to the authenticated user's role
router.get("/stats", auth_js_1.authenticateUser, controller_js_1.DashboardController.getStats);
exports.default = router;
