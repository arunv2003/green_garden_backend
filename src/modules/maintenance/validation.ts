import { z } from "zod";

export const generateBillsSchema = z.object({
  billingMonth: z.number().min(1).max(12).optional(),
  month: z.number().min(1).max(12).optional(),
  billingYear: z.number().min(2020).max(2050).optional(),
  year: z.number().min(2020).max(2050).optional(),
  dueDate: z.string({ required_error: "Due date required" }),
  additionalCharges: z.number().min(0).default(0),
  remarks: z.string().optional(),
});

export const createSingleBillSchema = z.object({
  flatId: z.number({ required_error: "Flat ID is required" }),
  residentId: z.number().optional(),
  billingMonth: z.number().min(1).max(12),
  billingYear: z.number().min(2020).max(2050),
  baseAmount: z.number().min(0),
  additionalCharges: z.number().min(0).default(0),
  lateFee: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  dueDate: z.string(),
  remarks: z.string().optional(),
});

export const updateBillSchema = z.object({
  additionalCharges: z.number().min(0).optional(),
  lateFee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  status: z.enum(["UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  remarks: z.string().optional(),
});
