import { Request, Response, NextFunction } from "express";
import { StayService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class StayController {
  static async getAllStays(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, userId, roomId, search, page, limit } = req.query;

      let targetUserId = userId ? parseInt(String(userId), 10) : undefined;
      if (req.user?.role === "USER") {
        targetUserId = req.user.userId;
      }

      const result = await StayService.getAllStays({
        status: status ? String(status) : undefined,
        userId: targetUserId,
        roomId: roomId ? parseInt(String(roomId), 10) : undefined,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, result.items, "Stays fetched successfully", 200, result.meta);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch stays", 500);
    }
  }

  static async getStayById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid stay ID", 400);

      const stay = await StayService.getStayById(id);
      if (req.user?.role === "USER" && stay.userId !== req.user.userId) {
        return sendError(res, "Access denied. You can only view your own stay history.", 403);
      }

      sendSuccess(res, stay, "Stay details fetched");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch stay", 404);
    }
  }


  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await StayService.checkIn(req.body, req.user?.userId);
      sendSuccess(res, result, "Guest checked in successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Check-in failed", 400);
    }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid stay ID", 400);

      const result = await StayService.checkOut(id, req.body, req.user?.userId);
      sendSuccess(res, result, "Guest checked out successfully");
    } catch (err: any) {
      sendError(res, err.message || "Check-out failed", 400);
    }
  }

  static async updateStay(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid stay ID", 400);
      const result = await StayService.updateStay(id, req.body);
      sendSuccess(res, result, "Stay updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update stay", 400);
    }
  }

  static async deleteStay(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid stay ID", 400);
      const result = await StayService.deleteStay(id);
      sendSuccess(res, result, "Stay deleted successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete stay", 400);
    }
  }
}
