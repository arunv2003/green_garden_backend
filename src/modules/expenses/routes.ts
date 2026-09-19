import { Router } from "express";
import { ExpenseController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { createExpenseSchema } from "./validation.js";

const router = Router();

// Accountant & Secretary can view and manage expenses
router.get("/", authenticateUser, authorizeRole("ACCOUNTANT", "SECRETARY"), ExpenseController.getAllExpenses);

router.post(
  "/",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  validateBody(createExpenseSchema),
  ExpenseController.createExpense
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  ExpenseController.updateExpense
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  ExpenseController.deleteExpense
);

export default router;
