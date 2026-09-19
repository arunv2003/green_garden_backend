import { Router } from "express";
import { DashboardController } from "./controller.js";
import { authenticateUser } from "../../middlewares/auth.js";

const router = Router();

// Endpoint adapts automatically to the authenticated user's role
router.get("/stats", authenticateUser, DashboardController.getStats);

export default router;
