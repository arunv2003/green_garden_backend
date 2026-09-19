"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitVisitorSchema = exports.updateVisitorSchema = exports.createVisitorSchema = void 0;
const zod_1 = require("zod");
exports.createVisitorSchema = zod_1.z.object({
    flatId: zod_1.z.number({ required_error: "Flat selection required" }),
    visitorName: zod_1.z.string().min(2, "Visitor name must be at least 2 characters"),
    mobile: zod_1.z.string().min(10, "10-digit mobile number required"),
    purpose: zod_1.z.string().default("Guest / Personal"),
    vehicleNumber: zod_1.z.string().optional(),
    entryDate: zod_1.z.string().default(() => new Date().toISOString().slice(0, 10)),
    entryTime: zod_1.z.string().default(() => new Date().toTimeString().slice(0, 8)),
    status: zod_1.z.enum(["EXPECTED", "INSIDE", "EXITED", "REJECTED"]).default("INSIDE"),
});
exports.updateVisitorSchema = exports.createVisitorSchema.partial();
exports.exitVisitorSchema = zod_1.z.object({
    exitDate: zod_1.z.string().default(() => new Date().toISOString().slice(0, 10)),
    exitTime: zod_1.z.string().default(() => new Date().toTimeString().slice(0, 8)),
});
