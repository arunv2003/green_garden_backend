"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class AuthController {
    static async login(req, res, next) {
        try {
            const { identifier, password } = req.body;
            const result = await service_js_1.AuthService.login(identifier, password);
            (0, response_js_1.sendSuccess)(res, result, "Login successful");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Login failed", 401);
        }
    }
    static async me(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            }
            const user = await service_js_1.AuthService.getCurrentUser(userId);
            (0, response_js_1.sendSuccess)(res, user, "Current user profile");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to get user profile", 404);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            }
            const updated = await service_js_1.AuthService.updateProfile(userId, req.body);
            (0, response_js_1.sendSuccess)(res, updated, "Profile updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update profile", 400);
        }
    }
    static async changePassword(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return (0, response_js_1.sendError)(res, "Unauthorized", 401);
            }
            const { currentPassword, newPassword } = req.body;
            const result = await service_js_1.AuthService.changePassword(userId, currentPassword, newPassword);
            (0, response_js_1.sendSuccess)(res, result, "Password changed successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to change password", 400);
        }
    }
    static async logout(req, res) {
        (0, response_js_1.sendSuccess)(res, null, "Logged out successfully");
    }
}
exports.AuthController = AuthController;
