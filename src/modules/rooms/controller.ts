import { Request, Response, NextFunction } from "express";
import { RoomService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class RoomController {
  static async getAllRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, floor, status, roomType, page, limit } = req.query;
      const result = await RoomService.getAllRooms({
        search: search ? String(search) : undefined,
        floor: floor !== undefined && floor !== "ALL" ? parseInt(String(floor), 10) : undefined,
        status: status ? String(status) : undefined,
        roomType: roomType ? String(roomType) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, result.items, "Rooms fetched successfully", 200, result.meta);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch rooms", 500);
    }
  }

  static async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid room ID", 400);

      const room = await RoomService.getRoomById(id);
      sendSuccess(res, room, "Room details fetched");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch room", 404);
    }
  }

  static async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const newRoom = await RoomService.createRoom(req.body);
      sendSuccess(res, newRoom, "Room created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to create room", 400);
    }
  }

  static async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid room ID", 400);

      const updated = await RoomService.updateRoom(id, req.body);
      sendSuccess(res, updated, "Room updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update room", 400);
    }
  }

  static async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid room ID", 400);

      const result = await RoomService.deleteRoom(id);
      sendSuccess(res, result, "Room deleted successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete room", 400);
    }
  }
}
