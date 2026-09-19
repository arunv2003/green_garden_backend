import { Router } from "express";
import { SocietyController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import {
  updateSocietySchema,
  createBlockSchema,
  updateBlockSchema,
  createFloorSchema,
} from "./validation.js";

const router = Router();

// Society Details (any authenticated user can view, only Secretary can edit)
router.get("/", authenticateUser, SocietyController.getSociety);
router.put("/", authenticateUser, authorizeRole("SECRETARY"), validateBody(updateSocietySchema), SocietyController.updateSociety);

// Blocks (Towers)
router.get("/blocks", authenticateUser, SocietyController.getBlocks);
router.post("/blocks", authenticateUser, authorizeRole("SECRETARY"), validateBody(createBlockSchema), SocietyController.createBlock);
router.put("/blocks/:id", authenticateUser, authorizeRole("SECRETARY"), validateBody(updateBlockSchema), SocietyController.updateBlock);
router.delete("/blocks/:id", authenticateUser, authorizeRole("SECRETARY"), SocietyController.deleteBlock);

// Floors
router.get("/floors", authenticateUser, SocietyController.getFloors);
router.post("/floors", authenticateUser, authorizeRole("SECRETARY"), validateBody(createFloorSchema), SocietyController.createFloor);

export default router;
