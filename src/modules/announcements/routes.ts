import { Router } from "express";
import { AnnouncementController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { createAnnouncementSchema } from "./validation.js";

const router = Router();

// All authenticated roles can read announcements
router.get("/", authenticateUser, AnnouncementController.getAllAnnouncements);

// Only Secretary can publish or remove announcements
router.post(
  "/",
  authenticateUser,
  authorizeRole("SECRETARY"),
  validateBody(createAnnouncementSchema),
  AnnouncementController.createAnnouncement
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY"),
  AnnouncementController.updateAnnouncement
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY"),
  AnnouncementController.deleteAnnouncement
);

export default router;
