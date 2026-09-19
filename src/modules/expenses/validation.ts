import { z } from "zod";
import { EXPENSE_CATEGORIES } from "./expenses.schema.js";

export const createExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).default("OTHER"),
  title: z.string().min(2, "Expense title must be at least 2 characters"),
  amount: z.number().positive("Amount must be greater than 0"),
  expenseDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"]).default("BANK_TRANSFER"),
  vendor: z.string().optional(),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});
