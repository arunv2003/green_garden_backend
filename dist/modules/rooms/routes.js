"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// Everyone authenticated (USER, SECRETARY, ACCOUNTANT) can view rooms and room details
router.get("/", auth_js_1.authenticateUser, controller_js_1.RoomController.getAllRooms);
router.get("/:id", auth_js_1.authenticateUser, controller_js_1.RoomController.getRoomById);
// SECRETARY and ACCOUNTANT can create, update or delete rooms
router.post("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), (0, validate_js_1.validateBody)(validation_js_1.createRoomSchema), controller_js_1.RoomController.createRoom);
router.patch("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), (0, validate_js_1.validateBody)(validation_js_1.updateRoomSchema), controller_js_1.RoomController.updateRoom);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY", "ACCOUNTANT"), controller_js_1.RoomController.deleteRoom);
exports.default = router;
