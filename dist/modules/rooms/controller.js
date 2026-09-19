"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class RoomController {
    static async getAllRooms(req, res, next) {
        try {
            const { search, floor, status, roomType, page, limit } = req.query;
            const result = await service_js_1.RoomService.getAllRooms({
                search: search ? String(search) : undefined,
                floor: floor !== undefined && floor !== "ALL" ? parseInt(String(floor), 10) : undefined,
                status: status ? String(status) : undefined,
                roomType: roomType ? String(roomType) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, result.items, "Rooms fetched successfully", 200, result.meta);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch rooms", 500);
        }
    }
    static async getRoomById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid room ID", 400);
            const room = await service_js_1.RoomService.getRoomById(id);
            (0, response_js_1.sendSuccess)(res, room, "Room details fetched");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch room", 404);
        }
    }
    static async createRoom(req, res, next) {
        try {
            const newRoom = await service_js_1.RoomService.createRoom(req.body);
            (0, response_js_1.sendSuccess)(res, newRoom, "Room created successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to create room", 400);
        }
    }
    static async updateRoom(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid room ID", 400);
            const updated = await service_js_1.RoomService.updateRoom(id, req.body);
            (0, response_js_1.sendSuccess)(res, updated, "Room updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update room", 400);
        }
    }
    static async deleteRoom(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid room ID", 400);
            const result = await service_js_1.RoomService.deleteRoom(id);
            (0, response_js_1.sendSuccess)(res, result, "Room deleted successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete room", 400);
        }
    }
}
exports.RoomController = RoomController;
