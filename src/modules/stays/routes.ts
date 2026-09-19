import { Router } from "express";
import { StayController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { checkInSchema, checkOutSchema } from "./validation.js";

const router = Router();

// Everyone can view stays (filtered per permissions)
router.get("/", authenticateUser, StayController.getAllStays);
router.get("/:id", authenticateUser, StayController.getStayById);

// Secretary and Accountant manage check-in and check-out
router.post(
  "/check-in",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  validateBody(checkInSchema),
  StayController.checkIn
);

router.post(
  "/:id/check-out",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  validateBody(checkOutSchema),
  StayController.checkOut
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  StayController.updateStay
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  StayController.deleteStay
);

export default router;
