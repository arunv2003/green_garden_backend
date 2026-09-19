"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpenseSchema = void 0;
const zod_1 = require("zod");
const expenses_schema_js_1 = require("./expenses.schema.js");
exports.createExpenseSchema = zod_1.z.object({
    category: zod_1.z.enum(expenses_schema_js_1.EXPENSE_CATEGORIES).default("OTHER"),
    title: zod_1.z.string().min(2, "Expense title must be at least 2 characters"),
    amount: zod_1.z.number().positive("Amount must be greater than 0"),
    expenseDate: zod_1.z.string().default(() => new Date().toISOString().slice(0, 10)),
    paymentMethod: zod_1.z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"]).default("BANK_TRANSFER"),
    vendor: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    receiptUrl: zod_1.z.string().optional(),
});
