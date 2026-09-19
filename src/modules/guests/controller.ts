import { Request, Response, NextFunction } from "express";
import { GuestService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class GuestController {
  static async getAllGuests(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, role, page, limit } = req.query;
      const result = await GuestService.getAllGuests({
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        role: role ? String(role) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, result.items, "Guests fetched successfully", 200, result.meta);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch guests", 500);
    }
  }

  static async getGuestById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid guest ID", 400);

      // If user role, ensure they can only view their own profile
      if (req.user?.role === "USER" && req.user.userId !== id) {
        return sendError(res, "Access denied. You can only view your own profile.", 403);
      }

      const guest = await GuestService.getGuestById(id);
      sendSuccess(res, guest, "Guest profile details");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch guest", 404);
    }
  }

  static async createGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await GuestService.createGuest(req.body);
      sendSuccess(res, result, "Guest created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to create guest", 400);
    }
  }

  static async updateGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid guest ID", 400);

      const updated = await GuestService.updateGuest(id, req.body);
      sendSuccess(res, updated, "Guest updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update guest", 400);
    }
  }

  static async deleteGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid guest ID", 400);

      const result = await GuestService.deleteGuest(id);
      sendSuccess(res, result, "Guest deleted successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete guest", 400);
    }
  }
}
