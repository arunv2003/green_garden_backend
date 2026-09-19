import { Router } from "express";
import { BillController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { generateBillsSchema } from "./validation.js";

const router = Router();

// Regular users can view their own bills, Secretary/Accountant can view all
router.get("/", authenticateUser, BillController.getAllBills);
router.get("/:id", authenticateUser, BillController.getBillById);

// Accountant and Secretary can generate monthly bills
router.post(
  "/generate",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  validateBody(generateBillsSchema),
  BillController.generateMonthlyBills
);

export default router;
