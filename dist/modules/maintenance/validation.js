"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBillSchema = exports.createSingleBillSchema = exports.generateBillsSchema = void 0;
const zod_1 = require("zod");
exports.generateBillsSchema = zod_1.z.object({
    billingMonth: zod_1.z.number().min(1).max(12).optional(),
    month: zod_1.z.number().min(1).max(12).optional(),
    billingYear: zod_1.z.number().min(2020).max(2050).optional(),
    year: zod_1.z.number().min(2020).max(2050).optional(),
    dueDate: zod_1.z.string({ required_error: "Due date required" }),
    additionalCharges: zod_1.z.number().min(0).default(0),
    remarks: zod_1.z.string().optional(),
});
exports.createSingleBillSchema = zod_1.z.object({
    flatId: zod_1.z.number({ required_error: "Flat ID is required" }),
    residentId: zod_1.z.number().optional(),
    billingMonth: zod_1.z.number().min(1).max(12),
    billingYear: zod_1.z.number().min(2020).max(2050),
    baseAmount: zod_1.z.number().min(0),
    additionalCharges: zod_1.z.number().min(0).default(0),
    lateFee: zod_1.z.number().min(0).default(0),
    discount: zod_1.z.number().min(0).default(0),
    dueDate: zod_1.z.string(),
    remarks: zod_1.z.string().optional(),
});
exports.updateBillSchema = zod_1.z.object({
    additionalCharges: zod_1.z.number().min(0).optional(),
    lateFee: zod_1.z.number().min(0).optional(),
    discount: zod_1.z.number().min(0).optional(),
    dueDate: zod_1.z.string().optional(),
    status: zod_1.z.enum(["UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]).optional(),
    remarks: zod_1.z.string().optional(),
});
