import { Router } from "express";
import { GuestController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { createGuestSchema, updateGuestSchema } from "./validation.js";

const router = Router();

// Secretary and Accountant can list guests
router.get(
  "/",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  GuestController.getAllGuests
);

// Guests can view their own profile, Secretary/Accountant can view any
router.get("/:id", authenticateUser, GuestController.getGuestById);

// Secretary and Accountant can create, update, delete guests
router.post(
  "/",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  validateBody(createGuestSchema),
  GuestController.createGuest
);

router.patch(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  validateBody(updateGuestSchema),
  GuestController.updateGuest
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  validateBody(updateGuestSchema),
  GuestController.updateGuest
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  GuestController.deleteGuest
);

export default router;
