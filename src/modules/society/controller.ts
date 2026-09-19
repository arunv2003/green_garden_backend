import { Request, Response } from "express";
import { SocietyService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class SocietyController {
  static async getSociety(req: Request, res: Response) {
    try {
      const data = await SocietyService.getSocietyInfo();
      sendSuccess(res, data, "Society details fetched");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch society info", 500);
    }
  }

  static async updateSociety(req: Request, res: Response) {
    try {
      const data = await SocietyService.updateSocietyInfo(req.body);
      sendSuccess(res, data, "Society details updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update society info", 400);
    }
  }

  static async getBlocks(req: Request, res: Response) {
    try {
      const data = await SocietyService.getAllBlocks();
      sendSuccess(res, data, "Blocks fetched successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch blocks", 500);
    }
  }

  static async createBlock(req: Request, res: Response) {
    try {
      const data = await SocietyService.createBlock(req.body);
      sendSuccess(res, data, "Tower/Block created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to create block", 400);
    }
  }

  static async updateBlock(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid block ID", 400);
      const data = await SocietyService.updateBlock(id, req.body);
      sendSuccess(res, data, "Tower/Block updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update block", 400);
    }
  }

  static async deleteBlock(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid block ID", 400);
      const data = await SocietyService.deleteBlock(id);
      sendSuccess(res, data, "Tower/Block deleted successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete block", 400);
    }
  }

  static async getFloors(req: Request, res: Response) {
    try {
      const blockId = req.query.blockId ? parseInt(String(req.query.blockId), 10) : undefined;
      const data = await SocietyService.getFloors(blockId);
      sendSuccess(res, data, "Floors fetched successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch floors", 500);
    }
  }

  static async createFloor(req: Request, res: Response) {
    try {
      const data = await SocietyService.createFloor(req.body);
      sendSuccess(res, data, "Floor created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to create floor", 400);
    }
  }
}
