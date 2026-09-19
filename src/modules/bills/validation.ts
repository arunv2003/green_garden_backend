import { z } from "zod";

export const generateBillsSchema = z.object({
  billingMonth: z.coerce.number().int().min(1).max(12),
  billingYear: z.coerce.number().int().min(2020).max(2100),
  dueDate: z.string().optional(),
});
