import { Request, Response } from "express";
import { VisitorService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class VisitorController {
  static async getAllVisitors(req: Request, res: Response) {
    try {
      const { search, flatId, status, date, page, limit } = req.query;
      const data = await VisitorService.getAllVisitors({
        search: search ? String(search) : undefined,
        flatId: flatId ? parseInt(String(flatId), 10) : undefined,
        status: status ? String(status) : undefined,
        date: date ? String(date) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, data.items, "Visitors fetched successfully", 200, { ...data.meta, summary: data.summary });
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch visitors", 500);
    }
  }

  static async getInsideVisitors(req: Request, res: Response) {
    try {
      const data = await VisitorService.getInsideVisitors();
      sendSuccess(res, data, "Currently inside visitors");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch inside visitors", 500);
    }
  }

  static async logVisitorEntry(req: Request, res: Response) {
    try {
      const operatorId = req.user?.userId;
      const data = await VisitorService.logVisitorEntry(req.body, operatorId);
      sendSuccess(res, data, "Visitor entry logged successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to log visitor", 400);
    }
  }

  static async recordVisitorExit(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid visitor ID", 400);
      const operatorId = req.user?.userId;
      const data = await VisitorService.recordVisitorExit(id, req.body, operatorId);
      sendSuccess(res, data, "Visitor exit recorded successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to record visitor exit", 400);
    }
  }

  static async updateVisitor(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid visitor ID", 400);
      const data = await VisitorService.updateVisitor(id, req.body);
      sendSuccess(res, data, "Visitor updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update visitor", 400);
    }
  }

  static async deleteVisitor(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid visitor ID", 400);
      const data = await VisitorService.deleteVisitor(id);
      sendSuccess(res, data, "Visitor deleted successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete visitor", 400);
    }
  }
}
