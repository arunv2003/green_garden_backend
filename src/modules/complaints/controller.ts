import { Request, Response } from "express";
import { ComplaintService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class ComplaintController {
  static async getAllComplaints(req: Request, res: Response) {
    try {
      const { category, priority, status, flatId, createdBy, search, page, limit } = req.query;

      // If user is resident, default to showing their complaints unless secretary
      let filterCreatedBy = createdBy ? parseInt(String(createdBy), 10) : undefined;
      if (req.user?.role === "USER") {
        filterCreatedBy = req.user.userId;
      }

      const data = await ComplaintService.getAllComplaints({
        category: category ? String(category) : undefined,
        priority: priority ? String(priority) : undefined,
        status: status ? String(status) : undefined,
        flatId: flatId ? parseInt(String(flatId), 10) : undefined,
        createdBy: filterCreatedBy,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, data.items, "Complaints fetched successfully", 200, { ...data.meta, summary: data.summary });
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch complaints", 500);
    }
  }

  static async getComplaintById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid complaint ID", 400);
      const data = await ComplaintService.getComplaintById(id);
      sendSuccess(res, data, "Complaint details");
    } catch (err: any) {
      sendError(res, err.message || "Complaint not found", 404);
    }
  }

  static async createComplaint(req: Request, res: Response) {
    try {
      const creatorUserId = req.user?.userId;
      if (!creatorUserId) return sendError(res, "Unauthorized", 401);
      const data = await ComplaintService.createComplaint(req.body, creatorUserId);
      sendSuccess(res, data, "Complaint filed successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to file complaint", 400);
    }
  }

  static async updateComplaintStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid complaint ID", 400);
      const operatorId = req.user?.userId;
      const data = await ComplaintService.updateComplaintStatus(id, req.body, operatorId);
      sendSuccess(res, data, "Complaint status updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update complaint", 400);
    }
  }

  static async updateComplaint(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid complaint ID", 400);
      const operatorId = req.user?.userId;
      const data = await ComplaintService.updateComplaint(id, req.body, operatorId);
      sendSuccess(res, data, "Complaint updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update complaint", 400);
    }
  }

  static async deleteComplaint(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid complaint ID", 400);
      const data = await ComplaintService.deleteComplaint(id);
      sendSuccess(res, data, "Complaint deleted successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete complaint", 400);
    }
  }
}
