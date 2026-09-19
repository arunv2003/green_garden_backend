import { Router } from "express";
import { RoomController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { createRoomSchema, updateRoomSchema } from "./validation.js";

const router = Router();

// Everyone authenticated (USER, SECRETARY, ACCOUNTANT) can view rooms and room details
router.get("/", authenticateUser, RoomController.getAllRooms);
router.get("/:id", authenticateUser, RoomController.getRoomById);

// SECRETARY and ACCOUNTANT can create, update or delete rooms
router.post(
  "/",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  validateBody(createRoomSchema),
  RoomController.createRoom
);

router.patch(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  validateBody(updateRoomSchema),
  RoomController.updateRoom
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  RoomController.deleteRoom
);

export default router;
