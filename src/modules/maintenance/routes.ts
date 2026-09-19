import { Router } from "express";
import { MaintenanceController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import {
  generateBillsSchema,
  createSingleBillSchema,
  updateBillSchema,
} from "./validation.js";

const router = Router();

// Allow both /api/maintenance and /api/maintenance/bills
router.get("/", authenticateUser, MaintenanceController.getAllBills);
router.get("/bills", authenticateUser, MaintenanceController.getAllBills);

// Accountant & Secretary can generate bills or create/update bills
router.post(
  "/generate",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  validateBody(generateBillsSchema),
  MaintenanceController.generateMonthlyBills
);

router.post(
  "/",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  validateBody(createSingleBillSchema),
  MaintenanceController.createBill
);

router.post(
  "/bills",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  validateBody(createSingleBillSchema),
  MaintenanceController.createBill
);

router.get("/bills/:id", authenticateUser, MaintenanceController.getBillById);
router.get("/:id(\\d+)", authenticateUser, MaintenanceController.getBillById);

router.put(
  "/bills/:id",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  validateBody(updateBillSchema),
  MaintenanceController.updateBill
);

router.put(
  "/:id(\\d+)",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  validateBody(updateBillSchema),
  MaintenanceController.updateBill
);

router.delete(
  "/bills/:id",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  MaintenanceController.deleteBill
);

router.delete(
  "/:id(\\d+)",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  MaintenanceController.deleteBill
);

export default router;
