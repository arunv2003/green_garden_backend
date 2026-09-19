"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBillsSchema = void 0;
const zod_1 = require("zod");
exports.generateBillsSchema = zod_1.z.object({
    billingMonth: zod_1.z.coerce.number().int().min(1).max(12),
    billingYear: zod_1.z.coerce.number().int().min(2020).max(2100),
    dueDate: zod_1.z.string().optional(),
});
