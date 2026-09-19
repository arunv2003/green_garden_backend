import { Router } from "express";
import { PaymentController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { createPaymentSchema } from "./validation.js";

const router = Router();

// Regular users can view their own payments, Accountant/Secretary can view all
router.get("/", authenticateUser, PaymentController.getAllPayments);
router.get("/:id", authenticateUser, PaymentController.getPaymentById);
router.get("/:id/receipt", authenticateUser, PaymentController.getReceipt);

// ACCOUNTANT and SECRETARY can record, edit, or delete payments
router.post(
  "/",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  validateBody(createPaymentSchema),
  PaymentController.createPayment
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  PaymentController.updatePayment
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("ACCOUNTANT", "SECRETARY"),
  PaymentController.deletePayment
);

export default router;
