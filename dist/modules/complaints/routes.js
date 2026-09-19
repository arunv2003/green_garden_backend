"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// All authenticated roles can list complaints (User sees own, Secretary sees all)
router.get("/", auth_js_1.authenticateUser, controller_js_1.ComplaintController.getAllComplaints);
router.get("/:id", auth_js_1.authenticateUser, controller_js_1.ComplaintController.getComplaintById);
// Any user can create a complaint
router.post("/", auth_js_1.authenticateUser, (0, validate_js_1.validateBody)(validation_js_1.createComplaintSchema), controller_js_1.ComplaintController.createComplaint);
// Only Secretary & Accountant can assign and resolve complaints
router.patch("/:id/status", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), (0, validate_js_1.validateBody)(validation_js_1.updateComplaintStatusSchema), controller_js_1.ComplaintController.updateComplaintStatus);
router.put("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), controller_js_1.ComplaintController.updateComplaint);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), controller_js_1.ComplaintController.deleteComplaint);
exports.default = router;
