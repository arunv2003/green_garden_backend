import { Request, Response } from "express";
import { AnnouncementService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class AnnouncementController {
  static async getAllAnnouncements(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const data = await AnnouncementService.getAllAnnouncements(status ? String(status) : undefined);
      sendSuccess(res, data, "Announcements fetched successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch announcements", 500);
    }
  }

  static async createAnnouncement(req: Request, res: Response) {
    try {
      const authorUserId = req.user?.userId;
      if (!authorUserId) return sendError(res, "Unauthorized", 401);
      const data = await AnnouncementService.createAnnouncement(req.body, authorUserId);
      sendSuccess(res, data, "Announcement published successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to publish announcement", 400);
    }
  }

  static async updateAnnouncement(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid ID", 400);
      const operatorId = req.user?.userId;
      const data = await AnnouncementService.updateAnnouncement(id, req.body, operatorId);
      sendSuccess(res, data, "Announcement updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update announcement", 400);
    }
  }

  static async deleteAnnouncement(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid ID", 400);
      const operatorId = req.user?.userId;
      const data = await AnnouncementService.deleteAnnouncement(id, operatorId);
      sendSuccess(res, data, "Announcement removed");
    } catch (err: any) {
      sendError(res, err.message || "Failed to remove announcement", 400);
    }
  }
}
