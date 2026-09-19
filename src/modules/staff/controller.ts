import { Request, Response } from "express";
import { StaffService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class StaffController {
  static async getStaff(req: Request, res: Response) {
    try {
      const { search, role, page, limit } = req.query;
      const data = await StaffService.getStaffOverview({
        search: search ? String(search) : undefined,
        role: role ? String(role) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, data, "Staff members fetched successfully", 200, data.pagination);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch staff members", 500);
    }
  }

  static async createAccountant(req: Request, res: Response) {
    try {
      const creatorId = req.user?.userId;
      const data = await StaffService.createAccountant(req.body, creatorId);
      sendSuccess(res, data, "Accountant created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to create accountant", 400);
    }
  }

  static async updateAccountant(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid accountant ID", 400);
      const updaterId = req.user?.userId;
      const data = await StaffService.updateAccountant(id, req.body, updaterId);
      sendSuccess(res, data, "Accountant updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update accountant", 400);
    }
  }

  static async changeSecretary(req: Request, res: Response) {
    try {
      const operatorId = req.user?.userId;
      const paramId = req.params.id ? parseInt(req.params.id, 10) : undefined;
      const payload = paramId && !isNaN(paramId) ? { ...req.body, id: paramId } : req.body;
      const data = await StaffService.changeSecretary(payload, operatorId);
      sendSuccess(res, data, "Secretary updated / changed successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update secretary", 400);
    }
  }

  static async deleteStaff(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid staff ID", 400);
      const operatorId = req.user?.userId;
      if (!operatorId) {
        return sendError(res, "Unauthorized", 401);
      }
      const data = await StaffService.deleteStaff(id, operatorId);
      sendSuccess(res, data, "Staff member deactivated");
    } catch (err: any) {
      sendError(res, err.message || "Failed to deactivate staff member", 400);
    }
  }
}
