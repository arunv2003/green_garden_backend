"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    userId: zod_1.z.coerce.number().int().optional(),
    roomId: zod_1.z.coerce.number().int().optional(),
    stayId: zod_1.z.coerce.number().int().optional(),
    flatId: zod_1.z.coerce.number().int().optional(),
    residentId: zod_1.z.coerce.number().int().optional(),
    maintenanceBillId: zod_1.z.coerce.number().int().optional(),
    monthlyBillId: zod_1.z.coerce.number().int().optional(),
    billingMonth: zod_1.z.coerce.number().int().min(1).max(12),
    billingYear: zod_1.z.coerce.number().int().min(2020).max(2100),
    amount: zod_1.z.coerce.number().positive("Payment amount must be greater than 0"),
    paymentDate: zod_1.z.string().min(1, "Payment date is required"),
    paymentMethod: zod_1.z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"]).default("CASH"),
    transactionId: zod_1.z.string().optional(),
    remarks: zod_1.z.string().optional(),
});
