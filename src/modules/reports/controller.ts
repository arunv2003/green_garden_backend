import { Request, Response, NextFunction } from "express";
import { ReportService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class ReportController {
  static async getMonthlyCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const year = req.query.year ? parseInt(String(req.query.year), 10) : undefined;
      const report = await ReportService.getMonthlyCollection(year);
      sendSuccess(res, report, "Monthly collection report");
    } catch (err: any) {
      sendError(res, err.message || "Failed to generate monthly collection report", 500);
    }
  }

  static async getRoomRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.getRoomRevenue();
      sendSuccess(res, report, "Room revenue report");
    } catch (err: any) {
      sendError(res, err.message || "Failed to generate room revenue report", 500);
    }
  }

  static async getGuestLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.getGuestLedgerReport();
      sendSuccess(res, report, "Guest ledger report");
    } catch (err: any) {
      sendError(res, err.message || "Failed to generate guest ledger report", 500);
    }
  }

  static async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.query.type as any) || "monthly";
      const year = req.query.year ? parseInt(String(req.query.year), 10) : undefined;
      const csv = await ReportService.exportReportCsv(type, year);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=green_garden_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      res.status(200).send(csv);
    } catch (err: any) {
      sendError(res, err.message || "Failed to export CSV", 500);
    }
  }
}
