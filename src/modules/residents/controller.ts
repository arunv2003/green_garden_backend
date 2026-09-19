import { Request, Response } from "express";
import { ResidentService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export class ResidentController {
  static async getAllResidents(req: Request, res: Response) {
    try {
      const { search, flatId, residentType, status, page, limit } = req.query;
      const data = await ResidentService.getAllResidents({
        search: search ? String(search) : undefined,
        flatId: flatId ? parseInt(String(flatId), 10) : undefined,
        residentType: residentType ? String(residentType) : undefined,
        status: status ? String(status) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });
      sendSuccess(res, data.items, "Residents fetched successfully", 200, data.meta);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch residents", 500);
    }
  }

  static async getResidentById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid resident ID", 400);

      // If user role, check access
      if (req.user?.role === "USER") {
        // Can view own resident profile
      }

      const data = await ResidentService.getResidentById(id);
      sendSuccess(res, data, "Resident profile details");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch resident", 404);
    }
  }

  static async addResident(req: Request, res: Response) {
    try {
      const operatorId = req.user?.userId;
      const data = await ResidentService.addResident(req.body, operatorId);
      sendSuccess(res, data, "Resident registered successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to register resident", 400);
    }
  }

  static async updateResident(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid resident ID", 400);
      const operatorId = req.user?.userId;
      const data = await ResidentService.updateResident(id, req.body, operatorId);
      sendSuccess(res, data, "Resident updated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update resident", 400);
    }
  }

  static async moveOutResident(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid resident ID", 400);
      const operatorId = req.user?.userId;
      const data = await ResidentService.moveOutResident(id, req.body, operatorId);
      sendSuccess(res, data, "Resident moved out successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to process move out", 400);
    }
  }

  static async deleteResident(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid resident ID", 400);
      const data = await ResidentService.deleteResident(id);
      sendSuccess(res, data, "Resident deleted/deactivated successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to delete resident", 400);
    }
  }

  // Family Members
  static async getFamilyMembers(req: Request, res: Response) {
    try {
      const residentId = req.query.residentId ? parseInt(String(req.query.residentId), 10) : undefined;
      const flatId = req.query.flatId ? parseInt(String(req.query.flatId), 10) : undefined;
      const data = await ResidentService.getFamilyMembers(residentId, flatId);
      sendSuccess(res, data, "Family members fetched successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch family members", 500);
    }
  }

  static async addFamilyMember(req: Request, res: Response) {
    try {
      const data = await ResidentService.addFamilyMember(req.body);
      sendSuccess(res, data, "Family member added successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to add family member", 400);
    }
  }

  static async updateFamilyMember(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid ID", 400);
      const data = await ResidentService.updateFamilyMember(id, req.body);
      sendSuccess(res, data, "Family member updated");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update family member", 400);
    }
  }

  static async deleteFamilyMember(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid ID", 400);
      const data = await ResidentService.deleteFamilyMember(id);
      sendSuccess(res, data, "Family member removed");
    } catch (err: any) {
      sendError(res, err.message || "Failed to remove family member", 400);
    }
  }

  // Vehicles
  static async getVehicles(req: Request, res: Response) {
    try {
      const flatId = req.query.flatId ? parseInt(String(req.query.flatId), 10) : undefined;
      const residentId = req.query.residentId ? parseInt(String(req.query.residentId), 10) : undefined;
      const data = await ResidentService.getVehicles(flatId, residentId);
      sendSuccess(res, data, "Vehicles fetched successfully");
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch vehicles", 500);
    }
  }

  static async addVehicle(req: Request, res: Response) {
    try {
      const data = await ResidentService.addVehicle(req.body);
      sendSuccess(res, data, "Vehicle registered successfully", 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to register vehicle", 400);
    }
  }

  static async updateVehicle(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid ID", 400);
      const data = await ResidentService.updateVehicle(id, req.body);
      sendSuccess(res, data, "Vehicle updated");
    } catch (err: any) {
      sendError(res, err.message || "Failed to update vehicle", 400);
    }
  }

  static async deleteVehicle(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, "Invalid ID", 400);
      const data = await ResidentService.deleteVehicle(id);
      sendSuccess(res, data, "Vehicle removed");
    } catch (err: any) {
      sendError(res, err.message || "Failed to remove vehicle", 400);
    }
  }
}
