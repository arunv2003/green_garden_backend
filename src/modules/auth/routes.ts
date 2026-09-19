import { Router } from "express";
import { AuthController } from "./controller.js";
import { validateBody } from "../../middlewares/validate.js";
import { loginSchema, updateProfileSchema, changePasswordSchema } from "./validation.js";
import { authenticateUser } from "../../middlewares/auth.js";

const router = Router();

router.post("/login", validateBody(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", authenticateUser, AuthController.me);
router.put("/profile", authenticateUser, validateBody(updateProfileSchema), AuthController.updateProfile);
router.put("/password", authenticateUser, validateBody(changePasswordSchema), AuthController.changePassword);

export default router;

