"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResidentController = void 0;
const service_js_1 = require("./service.js");
const response_js_1 = require("../../utils/response.js");
class ResidentController {
    static async getAllResidents(req, res) {
        try {
            const { search, flatId, residentType, status, page, limit } = req.query;
            const data = await service_js_1.ResidentService.getAllResidents({
                search: search ? String(search) : undefined,
                flatId: flatId ? parseInt(String(flatId), 10) : undefined,
                residentType: residentType ? String(residentType) : undefined,
                status: status ? String(status) : undefined,
                page: page ? parseInt(String(page), 10) : undefined,
                limit: limit ? parseInt(String(limit), 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, data.items, "Residents fetched successfully", 200, data.meta);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch residents", 500);
        }
    }
    static async getResidentById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid resident ID", 400);
            // If user role, check access
            if (req.user?.role === "USER") {
                // Can view own resident profile
            }
            const data = await service_js_1.ResidentService.getResidentById(id);
            (0, response_js_1.sendSuccess)(res, data, "Resident profile details");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch resident", 404);
        }
    }
    static async addResident(req, res) {
        try {
            const operatorId = req.user?.userId;
            const data = await service_js_1.ResidentService.addResident(req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Resident registered successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to register resident", 400);
        }
    }
    static async updateResident(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid resident ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.ResidentService.updateResident(id, req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Resident updated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update resident", 400);
        }
    }
    static async moveOutResident(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid resident ID", 400);
            const operatorId = req.user?.userId;
            const data = await service_js_1.ResidentService.moveOutResident(id, req.body, operatorId);
            (0, response_js_1.sendSuccess)(res, data, "Resident moved out successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to process move out", 400);
        }
    }
    static async deleteResident(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid resident ID", 400);
            const data = await service_js_1.ResidentService.deleteResident(id);
            (0, response_js_1.sendSuccess)(res, data, "Resident deleted/deactivated successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to delete resident", 400);
        }
    }
    // Family Members
    static async getFamilyMembers(req, res) {
        try {
            const residentId = req.query.residentId ? parseInt(String(req.query.residentId), 10) : undefined;
            const flatId = req.query.flatId ? parseInt(String(req.query.flatId), 10) : undefined;
            const data = await service_js_1.ResidentService.getFamilyMembers(residentId, flatId);
            (0, response_js_1.sendSuccess)(res, data, "Family members fetched successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch family members", 500);
        }
    }
    static async addFamilyMember(req, res) {
        try {
            const data = await service_js_1.ResidentService.addFamilyMember(req.body);
            (0, response_js_1.sendSuccess)(res, data, "Family member added successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to add family member", 400);
        }
    }
    static async updateFamilyMember(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid ID", 400);
            const data = await service_js_1.ResidentService.updateFamilyMember(id, req.body);
            (0, response_js_1.sendSuccess)(res, data, "Family member updated");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update family member", 400);
        }
    }
    static async deleteFamilyMember(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid ID", 400);
            const data = await service_js_1.ResidentService.deleteFamilyMember(id);
            (0, response_js_1.sendSuccess)(res, data, "Family member removed");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to remove family member", 400);
        }
    }
    // Vehicles
    static async getVehicles(req, res) {
        try {
            const flatId = req.query.flatId ? parseInt(String(req.query.flatId), 10) : undefined;
            const residentId = req.query.residentId ? parseInt(String(req.query.residentId), 10) : undefined;
            const data = await service_js_1.ResidentService.getVehicles(flatId, residentId);
            (0, response_js_1.sendSuccess)(res, data, "Vehicles fetched successfully");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to fetch vehicles", 500);
        }
    }
    static async addVehicle(req, res) {
        try {
            const data = await service_js_1.ResidentService.addVehicle(req.body);
            (0, response_js_1.sendSuccess)(res, data, "Vehicle registered successfully", 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to register vehicle", 400);
        }
    }
    static async updateVehicle(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid ID", 400);
            const data = await service_js_1.ResidentService.updateVehicle(id, req.body);
            (0, response_js_1.sendSuccess)(res, data, "Vehicle updated");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to update vehicle", 400);
        }
    }
    static async deleteVehicle(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id))
                return (0, response_js_1.sendError)(res, "Invalid ID", 400);
            const data = await service_js_1.ResidentService.deleteVehicle(id);
            (0, response_js_1.sendSuccess)(res, data, "Vehicle removed");
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || "Failed to remove vehicle", 400);
        }
    }
}
exports.ResidentController = ResidentController;
