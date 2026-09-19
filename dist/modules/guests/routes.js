"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Secretary and Accountant can list guests
router.get("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), controller_js_1.GuestController.getAllGuests);
// Guests can view their own profile, Secretary/Accountant can view any
router.get("/:id", auth_js_1.authenticateUser, controller_js_1.GuestController.getGuestById);
// Secretary and Accountant can create, update, delete guests
router.post("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), (0, validate_js_1.validateBody)(validation_js_1.createGuestSchema), controller_js_1.GuestController.createGuest);
router.patch("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), (0, validate_js_1.validateBody)(validation_js_1.updateGuestSchema), controller_js_1.GuestController.updateGuest);
router.put("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), (0, validate_js_1.validateBody)(validation_js_1.updateGuestSchema), controller_js_1.GuestController.updateGuest);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), controller_js_1.GuestController.deleteGuest);
exports.default = router;
