import { Router } from "express";
import { ComplaintController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import { createComplaintSchema, updateComplaintStatusSchema } from "./validation.js";

const router = Router();

// All authenticated roles can list complaints (User sees own, Secretary sees all)
router.get("/", authenticateUser, ComplaintController.getAllComplaints);
router.get("/:id", authenticateUser, ComplaintController.getComplaintById);

// Any user can create a complaint
router.post(
  "/",
  authenticateUser,
  validateBody(createComplaintSchema),
  ComplaintController.createComplaint
);

// Only Secretary & Accountant can assign and resolve complaints
router.patch(
  "/:id/status",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  validateBody(updateComplaintStatusSchema),
  ComplaintController.updateComplaintStatus
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  ComplaintController.updateComplaint
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY", "ACCOUNTANT"),
  ComplaintController.deleteComplaint
);

export default router;
