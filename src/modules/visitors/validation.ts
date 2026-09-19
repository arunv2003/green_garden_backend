import { z } from "zod";

export const createVisitorSchema = z.object({
  flatId: z.number({ required_error: "Flat selection required" }),
  visitorName: z.string().min(2, "Visitor name must be at least 2 characters"),
  mobile: z.string().min(10, "10-digit mobile number required"),
  purpose: z.string().default("Guest / Personal"),
  vehicleNumber: z.string().optional(),
  entryDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  entryTime: z.string().default(() => new Date().toTimeString().slice(0, 8)),
  status: z.enum(["EXPECTED", "INSIDE", "EXITED", "REJECTED"]).default("INSIDE"),
});

export const updateVisitorSchema = createVisitorSchema.partial();

export const exitVisitorSchema = z.object({
  exitDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  exitTime: z.string().default(() => new Date().toTimeString().slice(0, 8)),
});
