"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatusSchema = exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
const complaints_schema_js_1 = require("./complaints.schema.js");
exports.createComplaintSchema = zod_1.z.object({
    flatId: zod_1.z.number().optional(),
    category: zod_1.z.enum(complaints_schema_js_1.COMPLAINT_CATEGORIES).default("MAINTENANCE"),
    subject: zod_1.z.string().min(3, "Subject must be at least 3 characters"),
    description: zod_1.z.string().min(5, "Description must be at least 5 characters"),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});
exports.updateComplaintStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
    assignedTo: zod_1.z.number().optional(),
    resolution: zod_1.z.string().optional(),
});
