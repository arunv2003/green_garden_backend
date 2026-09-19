"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFloorSchema = exports.updateBlockSchema = exports.createBlockSchema = exports.updateSocietySchema = void 0;
const zod_1 = require("zod");
exports.updateSocietySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    registrationNumber: zod_1.z.string().optional(),
    address: zod_1.z.string().min(5).optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    maintenanceDueDay: zod_1.z.number().min(1).max(31).optional(),
    lateFee: zod_1.z.number().min(0).optional(),
    logo: zod_1.z.string().optional(),
});
exports.createBlockSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, "Tower name required"),
    code: zod_1.z.string().min(1).optional(),
    blockCode: zod_1.z.string().min(1).optional(),
    numberOfFloors: zod_1.z.number().min(1).optional(),
    totalFloors: zod_1.z.number().min(1).optional(),
    description: zod_1.z.string().optional(),
})
    .refine((data) => Boolean(data.code || data.blockCode), {
    message: "Tower code is required",
    path: ["code"],
});
exports.updateBlockSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    code: zod_1.z.string().min(1).optional(),
    blockCode: zod_1.z.string().min(1).optional(),
    numberOfFloors: zod_1.z.number().min(1).optional(),
    totalFloors: zod_1.z.number().min(1).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
exports.createFloorSchema = zod_1.z.object({
    blockId: zod_1.z.number(),
    floorNumber: zod_1.z.number(),
    name: zod_1.z.string().min(1),
});
