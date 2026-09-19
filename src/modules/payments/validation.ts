import { z } from "zod";

export const createPaymentSchema = z.object({
  userId: z.coerce.number().int().optional(),
  roomId: z.coerce.number().int().optional(),
  stayId: z.coerce.number().int().optional(),
  flatId: z.coerce.number().int().optional(),
  residentId: z.coerce.number().int().optional(),
  maintenanceBillId: z.coerce.number().int().optional(),
  monthlyBillId: z.coerce.number().int().optional(),
  billingMonth: z.coerce.number().int().min(1).max(12),
  billingYear: z.coerce.number().int().min(2020).max(2100),
  amount: z.coerce.number().positive("Payment amount must be greater than 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"]).default("CASH"),
  transactionId: z.string().optional(),
  remarks: z.string().optional(),
});
