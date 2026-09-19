import { Router } from "express";
import { StaffController } from "./controller.js";
import { validateBody } from "../../middlewares/validate.js";
import {
  createAccountantSchema,
  updateAccountantSchema,
  changeSecretarySchema,
} from "./validation.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";

const router = Router();

// Staff management routes are accessible to SECRETARY and ACCOUNTANT
router.use(authenticateUser);
router.use(authorizeRole("SECRETARY", "ACCOUNTANT"));


router.get("/", StaffController.getStaff);
router.post("/accountant", validateBody(createAccountantSchema), StaffController.createAccountant);
router.put("/accountant/:id", validateBody(updateAccountantSchema), StaffController.updateAccountant);
router.post("/secretary", validateBody(changeSecretarySchema), StaffController.changeSecretary);
router.put("/secretary", validateBody(changeSecretarySchema), StaffController.changeSecretary);
router.put("/secretary/:id", validateBody(changeSecretarySchema), StaffController.changeSecretary);
router.delete("/:id", StaffController.deleteStaff);

export default router;
