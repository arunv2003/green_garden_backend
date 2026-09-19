"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Society Details (any authenticated user can view, only Secretary can edit)
router.get("/", auth_js_1.authenticateUser, controller_js_1.SocietyController.getSociety);
router.put("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.updateSocietySchema), controller_js_1.SocietyController.updateSociety);
// Blocks (Towers)
router.get("/blocks", auth_js_1.authenticateUser, controller_js_1.SocietyController.getBlocks);
router.post("/blocks", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createBlockSchema), controller_js_1.SocietyController.createBlock);
router.put("/blocks/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.updateBlockSchema), controller_js_1.SocietyController.updateBlock);
router.delete("/blocks/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), controller_js_1.SocietyController.deleteBlock);
// Floors
router.get("/floors", auth_js_1.authenticateUser, controller_js_1.SocietyController.getFloors);
router.post("/floors", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createFloorSchema), controller_js_1.SocietyController.createFloor);
exports.default = router;
