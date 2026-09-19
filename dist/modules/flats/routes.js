"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// All authenticated roles can list and view flats
router.get("/", auth_js_1.authenticateUser, controller_js_1.FlatController.getAllFlats);
router.get("/:idOrNumber", auth_js_1.authenticateUser, controller_js_1.FlatController.getFlatDetails);
// Only Secretary can create, update, or deactivate flats
router.post("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createFlatSchema), controller_js_1.FlatController.createFlat);
router.put("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.updateFlatSchema), controller_js_1.FlatController.updateFlat);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), controller_js_1.FlatController.deleteFlat);
exports.default = router;
