"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocietyController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class SocietyController {
    static async getSociety(req, res) {
        try {
            const data = await service_js_1.SocietyService.getSocietyInfo();
            (0, response_js_1.sendSuccess)(res, data, "Society details fetched");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch society info", 500);
        }
    }
    static async updateSociety(req, res) {
        try {
            const data = await service_js_1.SocietyService.updateSocietyInfo(req.body);
            (0, response_js_1.sendSuccess)(res, data, "Society details updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update society info", 400);
        }
    }
    static async getBlocks(req, res) {
        try {
            const data = await service_js_1.SocietyService.getAllBlocks();
            (0, response_js_1.sendSuccess)(res, data, "Blocks fetched successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch blocks", 500);
        }
    }
    static async createBlock(req, res) {
        try {
            const data = await service_js_1.SocietyService.createBlock(req.body);
            (0, response_js_1.sendSuccess)(res, data, "Tower/Block created successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to create block", 400);
        }
    }
    static async updateBlock(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid block ID", 400);
            const data = await service_js_1.SocietyService.updateBlock(id, req.body);
            (0, response_js_1.sendSuccess)(res, data, "Tower/Block updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update block", 400);
        }
    }
    static async deleteBlock(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid block ID", 400);
            const data = await service_js_1.SocietyService.deleteBlock(id);
            (0, response_js_1.sendSuccess)(res, data, "Tower/Block deleted successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete block", 400);
        }
    }
    static async getFloors(req, res) {
        try {
            const blockId = req.query.blockId ? parseInt(String(req.query.blockId), 10) : undefined;
            const data = await service_js_1.SocietyService.getFloors(blockId);
            (0, response_js_1.sendSuccess)(res, data, "Floors fetched successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch floors", 500);
        }
    }
    static async createFloor(req, res) {
        try {
            const data = await service_js_1.SocietyService.createFloor(req.body);
            (0, response_js_1.sendSuccess)(res, data, "Floor created successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to create floor", 400);
        }
    }
}
exports.SocietyController = SocietyController;
