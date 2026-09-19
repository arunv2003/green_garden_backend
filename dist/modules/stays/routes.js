"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Everyone can view stays (filtered per permissions)
router.get("/", auth_js_1.authenticateUser, controller_js_1.StayController.getAllStays);
router.get("/:id", auth_js_1.authenticateUser, controller_js_1.StayController.getStayById);
// Secretary and Accountant manage check-in and check-out
router.post("/check-in", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), (0, validate_js_1.validateBody)(validation_js_1.checkInSchema), controller_js_1.StayController.checkIn);
router.post("/:id/check-out", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), (0, validate_js_1.validateBody)(validation_js_1.checkOutSchema), controller_js_1.StayController.checkOut);
router.put("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), controller_js_1.StayController.updateStay);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), controller_js_1.StayController.deleteStay);
exports.default = router;
