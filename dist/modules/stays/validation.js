"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOutSchema = exports.checkInSchema = void 0;
const zod_1 = require("zod");
exports.checkInSchema = zod_1.z.object({
    userId: zod_1.z.coerce.number().int().positive("Guest selection is required"),
    roomId: zod_1.z.coerce.number().int().positive("Room selection is required"),
    checkInDate: zod_1.z.string().min(1, "Check-in date is required"),
    checkInTime: zod_1.z.string().default("10:00:00"),
    monthlyRent: zod_1.z.coerce.number().positive("Monthly rent is required"),
    securityDeposit: zod_1.z.coerce.number().min(0).default(0),
    startingMeter: zod_1.z.string().optional(),
    remarks: zod_1.z.string().optional(),
});
exports.checkOutSchema = zod_1.z.object({
    checkOutDate: zod_1.z.string().min(1, "Check-out date is required"),
    checkOutTime: zod_1.z.string().default("12:00:00"),
    checkOutReason: zod_1.z.string().optional(),
    securityDepositAdjustment: zod_1.z.coerce.number().default(0),
    remarks: zod_1.z.string().optional(),
});
