import { z } from "zod";

export const checkInSchema = z.object({
  userId: z.coerce.number().int().positive("Guest selection is required"),
  roomId: z.coerce.number().int().positive("Room selection is required"),
  checkInDate: z.string().min(1, "Check-in date is required"),
  checkInTime: z.string().default("10:00:00"),
  monthlyRent: z.coerce.number().positive("Monthly rent is required"),
  securityDeposit: z.coerce.number().min(0).default(0),
  startingMeter: z.string().optional(),
  remarks: z.string().optional(),
});

export const checkOutSchema = z.object({
  checkOutDate: z.string().min(1, "Check-out date is required"),
  checkOutTime: z.string().default("12:00:00"),
  checkOutReason: z.string().optional(),
  securityDepositAdjustment: z.coerce.number().default(0),
  remarks: z.string().optional(),
});
