"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const auth_js_1 = require("../../middlewares/auth.js");
const router = (0, express_1.Router)();
// Staff management routes are accessible to SECRETARY and ACCOUNTANT
router.use(auth_js_1.authenticateUser);
router.use((0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"));
router.get("/", controller_js_1.StaffController.getStaff);
router.post("/accountant", (0, validate_js_1.validateBody)(validation_js_1.createAccountantSchema), controller_js_1.StaffController.createAccountant);
router.put("/accountant/:id", (0, validate_js_1.validateBody)(validation_js_1.updateAccountantSchema), controller_js_1.StaffController.updateAccountant);
router.post("/secretary", (0, validate_js_1.validateBody)(validation_js_1.changeSecretarySchema), controller_js_1.StaffController.changeSecretary);
router.put("/secretary", (0, validate_js_1.validateBody)(validation_js_1.changeSecretarySchema), controller_js_1.StaffController.changeSecretary);
router.put("/secretary/:id", (0, validate_js_1.validateBody)(validation_js_1.changeSecretarySchema), controller_js_1.StaffController.changeSecretary);
router.delete("/:id", controller_js_1.StaffController.deleteStaff);
exports.default = router;
