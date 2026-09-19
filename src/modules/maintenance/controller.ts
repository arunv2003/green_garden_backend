import { Request, Response } from "express";
import { MaintenanceService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class MaintenanceController {
  static async getAllBills(req: Request, res: Response) {
    try {
      const { search, flatId, residentId, billingMonth, billingYear, status, page, limit } = req.query;
      const data = await MaintenanceService.getAllBills({
        search: search ? String(search) : undefined,
        flatId: flatId ? parseInt(String(flatId), 10) : undefined,
        residentId: residentId ? parseInt(String(residentId), 10) : undefined,
        billingMonth: (billingMonth || req.query.month) ? parseInt(String(billingMonth || req.query.month), 10) : undefined,
        billingYear: (billingYear || req.query.year) ? parseInt(String(billingYear || req.query.year), 10) : undefined,
        status: status ? String(status) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, data.items, "Maintenance bills fetched", 200, { ...data.meta, summary: data.summary });
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch bills", 500);
    }
  }

  static async getBillById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid bill ID", 400);
      const data = await MaintenanceService.getBillById(id);
      sendSuccess(res, data, "Maintenance bill details");
    } catch (err: any) {
      sendError(res, err.message || "Bill not found", 404);
    }
  }

  static async generateMonthlyBills(req: Request, res: Response) {
    try {
      const operatorId = req.user?.userId;
      const billingMonth = Number(req.body.billingMonth || req.body.month || new Date().getMonth() + 1);
      const billingYear = Number(req.body.billingYear || req.body.year || new Date().getFullYear());
      const data = await MaintenanceService.generateMonthlyBills({
        ...req.body,
        billingMonth,
        billingYear,
      }, operatorId);
      sendSuccess(res, data, `Monthly maintenance bills generated: ${data.generatedCount} generated, ${data.skippedCount} skipped`, 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to generate monthly bills", 400);
    }
  }

  static async createBill(req: Request, res: Response) {
    try {
      const operatorId = req.user?.userId;
      const data = await MaintenanceService.createBill(req.body, operatorId);
      sendSuccess(res, data, "Maintenance bill created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to create bill", 400);
    }
  }

  static async updateBill(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid bill ID", 400);
      const data = await MaintenanceService.updateBill(id, req.body);
      sendSuccess(res, data, "Maintenance bill updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update bill", 400);
    }
  }

  static async deleteBill(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid bill ID", 400);
      const data = await MaintenanceService.deleteBill(id);
      sendSuccess(res, data, "Maintenance bill deleted successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete bill", 400);
    }
  }
}
