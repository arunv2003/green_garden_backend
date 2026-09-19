import { Request, Response, NextFunction } from "express";
import { AuthService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = req.body;
      const result = await AuthService.login(identifier, password);
      sendSuccess(res, result, "Login successful");
    } catch (err: any) {
      sendError(res, err.message || "Login failed", 401);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, "Unauthorized", 401);
      }
      const user = await AuthService.getCurrentUser(userId);
      sendSuccess(res, user, "Current user profile");
    } catch (err: any) {
      sendError(res, err.message || "Failed to get user profile", 404);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, "Unauthorized", 401);
      }
      const updated = await AuthService.updateProfile(userId, req.body);
      sendSuccess(res, updated, "Profile updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update profile", 400);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, "Unauthorized", 401);
      }
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      sendSuccess(res, result, "Password changed successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to change password", 400);
    }
  }

  static async logout(req: Request, res: Response) {
    sendSuccess(res, null, "Logged out successfully");
  }
}
