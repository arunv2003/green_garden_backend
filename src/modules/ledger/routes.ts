import { Router } from "express";
import { LedgerController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";

const router = Router();

// Accountant and Secretary can view all ledgers
router.get(
  "/",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  LedgerController.getAllLedgers
);

// Guests can view their own ledger; Accountant/Secretary can view any
router.get("/:userId", authenticateUser, LedgerController.getUserLedger);

export default router;
