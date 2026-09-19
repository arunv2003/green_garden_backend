"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_js_1 = require("./controller.js");
const auth_js_1 = require("../../middlewares/auth.js");
const validate_js_1 = require("../../middlewares/validate.js");
const validation_js_1 = require("./validation.js");
const router = (0, express_1.Router)();
// All authenticated roles can read announcements
router.get("/", auth_js_1.authenticateUser, controller_js_1.AnnouncementController.getAllAnnouncements);
// Only Secretary can publish or remove announcements
router.post("/", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), (0, validate_js_1.validateBody)(validation_js_1.createAnnouncementSchema), controller_js_1.AnnouncementController.createAnnouncement);
router.put("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), controller_js_1.AnnouncementController.updateAnnouncement);
router.delete("/:id", auth_js_1.authenticateUser, (0, auth_js_1.authorizeRole)("SECRETARY"), controller_js_1.AnnouncementController.deleteAnnouncement);
exports.default = router;
