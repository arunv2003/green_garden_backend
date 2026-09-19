import { Router } from "express";
import { ReportController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";

const router = Router();

// Only Accountant and Secretary can access reports
router.get(
  "/monthly",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  ReportController.getMonthlyCollection
);

router.get(
  "/room-revenue",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  ReportController.getRoomRevenue
);

router.get(
  "/guest-ledger",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  ReportController.getGuestLedger
);

router.get(
  "/export-csv",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  ReportController.exportCsv
);

export default router;
