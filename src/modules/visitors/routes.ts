import { Router } from "express";
import { VisitorController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { createVisitorSchema, exitVisitorSchema } from "./validation.js";

const router = Router();

router.get("/", authenticateUser, VisitorController.getAllVisitors);
router.get("/inside", authenticateUser, VisitorController.getInsideVisitors);

router.post(
  "/",
  authenticateUser,
  validateBody(createVisitorSchema),
  VisitorController.logVisitorEntry
);

router.post(
  "/:id/exit",
  authenticateUser,
  validateBody(exitVisitorSchema),
  VisitorController.recordVisitorExit
);

router.put(
  "/:id",
  authenticateUser,
  VisitorController.updateVisitor
);

router.delete(
  "/:id",
  authenticateUser,
  VisitorController.deleteVisitor
);

export default router;
