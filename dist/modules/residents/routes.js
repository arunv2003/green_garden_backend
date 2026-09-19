"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Residents
router.get("/", auth_js_1.authenticateUser, controller_js_1.ResidentController.getAllResidents);
router.get("/:id", auth_js_1.authenticateUser, controller_js_1.ResidentController.getResidentById);
router.post("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createResidentSchema), controller_js_1.ResidentController.addResident);
router.put("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.updateResidentSchema), controller_js_1.ResidentController.updateResident);
router.post("/:id/move-out", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.moveOutSchema), controller_js_1.ResidentController.moveOutResident);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), controller_js_1.ResidentController.deleteResident);
// Family Members
router.get("/sub/family-members", auth_js_1.authenticateUser, controller_js_1.ResidentController.getFamilyMembers);
router.post("/sub/family-members", auth_js_1.authenticateUser, (0, validate_js_1.validateBody)(validation_js_1.createFamilyMemberSchema), controller_js_1.ResidentController.addFamilyMember);
router.post("/:id/family", auth_js_1.authenticateUser, (req, _res, next) => {
    req.body.residentId = req.body.residentId || parseInt(req.params.id, 10);
    if (req.body.phone && !req.body.mobile)
        req.body.mobile = req.body.phone;
    next();
}, (0, validate_js_1.validateBody)(validation_js_1.createFamilyMemberSchema), controller_js_1.ResidentController.addFamilyMember);
router.put("/sub/family-members/:id", auth_js_1.authenticateUser, controller_js_1.ResidentController.updateFamilyMember);
router.delete("/sub/family-members/:id", auth_js_1.authenticateUser, controller_js_1.ResidentController.deleteFamilyMember);
// Vehicles
router.get("/sub/vehicles", auth_js_1.authenticateUser, controller_js_1.ResidentController.getVehicles);
router.post("/sub/vehicles", auth_js_1.authenticateUser, (0, validate_js_1.validateBody)(validation_js_1.createVehicleSchema), controller_js_1.ResidentController.addVehicle);
router.post("/:id/vehicles", auth_js_1.authenticateUser, (req, _res, next) => {
    req.body.residentId = req.body.residentId || parseInt(req.params.id, 10);
    if (req.body.slotNumber && !req.body.parkingSlot)
        req.body.parkingSlot = req.body.slotNumber;
    next();
}, (0, validate_js_1.validateBody)(validation_js_1.createVehicleSchema), controller_js_1.ResidentController.addVehicle);
router.put("/sub/vehicles/:id", auth_js_1.authenticateUser, controller_js_1.ResidentController.updateVehicle);
router.delete("/sub/vehicles/:id", auth_js_1.authenticateUser, controller_js_1.ResidentController.deleteVehicle);
exports.default = router;
