import { Router } from "express";
import { FlatController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { createFlatSchema, updateFlatSchema } from "./validation.js";

const router = Router();

// All authenticated roles can list and view flats
router.get("/", authenticateUser, FlatController.getAllFlats);
router.get("/:idOrNumber", authenticateUser, FlatController.getFlatDetails);

// Only Secretary can create, update, or deactivate flats
router.post(
  "/",
  authenticateUser,
  authorizeRole("SECRETARY"),
  validateBody(createFlatSchema),
  FlatController.createFlat
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY"),
  validateBody(updateFlatSchema),
  FlatController.updateFlat
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY"),
  FlatController.deleteFlat
);

export default router;
