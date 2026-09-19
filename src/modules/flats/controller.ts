import { Request, Response } from "express";
import { FlatService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class FlatController {
  static async getAllFlats(req: Request, res: Response) {
    try {
      const { search, blockId, floorId, occupancyStatus, page, limit } = req.query;
      const data = await FlatService.getAllFlats({
        search: search ? String(search) : undefined,
        blockId: blockId ? parseInt(String(blockId), 10) : undefined,
        floorId: floorId ? parseInt(String(floorId), 10) : undefined,
        occupancyStatus: occupancyStatus ? String(occupancyStatus) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, data.items, "Flats fetched successfully", 200, data.meta);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch flats", 500);
    }
  }

  static async getFlatDetails(req: Request, res: Response) {
    try {
      const idOrNumber = req.params.idOrNumber;
      const data = await FlatService.getFlatDetails(idOrNumber);
      sendSuccess(res, data, "Flat 360 details fetched");
    } catch (err: any) {
      sendError(res, err.message || "Flat not found", 404);
    }
  }

  static async createFlat(req: Request, res: Response) {
    try {
      const data = await FlatService.createFlat(req.body);
      sendSuccess(res, data, "Flat created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to create flat", 400);
    }
  }

  static async updateFlat(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid flat ID", 400);
      const data = await FlatService.updateFlat(id, req.body);
      sendSuccess(res, data, "Flat updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update flat", 400);
    }
  }

  static async deleteFlat(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid flat ID", 400);
      const data = await FlatService.deleteFlat(id);
      sendSuccess(res, data, "Flat deactivated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to deactivate flat", 400);
    }
  }
}
