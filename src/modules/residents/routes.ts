import { Router } from "express";
import { ResidentController } from "./controller.js";
import { authenticateUser, authorizeRole } from "../../middlewares/auth.js";
import { validateBody } from "../../middlewares/validate.js";
import {
  createResidentSchema,
  updateResidentSchema,
  moveOutSchema,
  createFamilyMemberSchema,
  createVehicleSchema,
} from "./validation.js";

const router = Router();

// Residents
router.get("/", authenticateUser, ResidentController.getAllResidents);
router.get("/:id", authenticateUser, ResidentController.getResidentById);

router.post(
  "/",
  authenticateUser,
  authorizeRole("SECRETARY"),
  validateBody(createResidentSchema),
  ResidentController.addResident
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY"),
  validateBody(updateResidentSchema),
  ResidentController.updateResident
);

router.post(
  "/:id/move-out",
  authenticateUser,
  authorizeRole("SECRETARY"),
  validateBody(moveOutSchema),
  ResidentController.moveOutResident
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("SECRETARY"),
  ResidentController.deleteResident
);

// Family Members
router.get("/sub/family-members", authenticateUser, ResidentController.getFamilyMembers);
router.post(
  "/sub/family-members",
  authenticateUser,
  validateBody(createFamilyMemberSchema),
  ResidentController.addFamilyMember
);
router.post(
  "/:id/family",
  authenticateUser,
  (req, _res, next) => {
    req.body.residentId = req.body.residentId || parseInt(req.params.id, 10);
    if (req.body.phone && !req.body.mobile) req.body.mobile = req.body.phone;
    next();
  },
  validateBody(createFamilyMemberSchema),
  ResidentController.addFamilyMember
);
router.put(
  "/sub/family-members/:id",
  authenticateUser,
  ResidentController.updateFamilyMember
);
router.delete(
  "/sub/family-members/:id",
  authenticateUser,
  ResidentController.deleteFamilyMember
);

// Vehicles
router.get("/sub/vehicles", authenticateUser, ResidentController.getVehicles);
router.post(
  "/sub/vehicles",
  authenticateUser,
  validateBody(createVehicleSchema),
  ResidentController.addVehicle
);
router.post(
  "/:id/vehicles",
  authenticateUser,
  (req, _res, next) => {
    req.body.residentId = req.body.residentId || parseInt(req.params.id, 10);
    if (req.body.slotNumber && !req.body.parkingSlot) req.body.parkingSlot = req.body.slotNumber;
    next();
  },
  validateBody(createVehicleSchema),
  ResidentController.addVehicle
);
router.put(
  "/sub/vehicles/:id",
  authenticateUser,
  ResidentController.updateVehicle
);
router.delete(
  "/sub/vehicles/:id",
  authenticateUser,
  ResidentController.deleteVehicle
);

export default router;
