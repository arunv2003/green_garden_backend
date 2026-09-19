"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class FlatController {
    static async getAllFlats(req, res) {
        try {
            const { search, blockId, floorId, occupancyStatus, page, limit } = req.query;
            const data = await service_js_1.FlatService.getAllFlats({
                search: search ? String(search) : undefined,
                blockId: blockId ? parseInt(String(blockId), 10) : undefined,
                floorId: floorId ? parseInt(String(floorId), 10) : undefined,
                occupancyStatus: occupancyStatus ? String(occupancyStatus) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, data.items, "Flats fetched successfully", 200, data.meta);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch flats", 500);
        }
    }
    static async getFlatDetails(req, res) {
        try {
            const idOrNumber = req.params.idOrNumber;
            const data = await service_js_1.FlatService.getFlatDetails(idOrNumber);
            (0, response_js_1.sendSuccess)(res, data, "Flat 360 details fetched");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Flat not found", 404);
        }
    }
    static async createFlat(req, res) {
        try {
            const data = await service_js_1.FlatService.createFlat(req.body);
            (0, response_js_1.sendSuccess)(res, data, "Flat created successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to create flat", 400);
        }
    }
    static async updateFlat(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid flat ID", 400);
            const data = await service_js_1.FlatService.updateFlat(id, req.body);
            (0, response_js_1.sendSuccess)(res, data, "Flat updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update flat", 400);
        }
    }
    static async deleteFlat(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid flat ID", 400);
            const data = await service_js_1.FlatService.deleteFlat(id);
            (0, response_js_1.sendSuccess)(res, data, "Flat deactivated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to deactivate flat", 400);
        }
    }
}
exports.FlatController = FlatController;
