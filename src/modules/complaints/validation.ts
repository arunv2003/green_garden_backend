import { z } from "zod";
import { COMPLAINT_CATEGORIES } from "./complaints.schema.js";

export const createComplaintSchema = z.object({
  flatId: z.number().optional(),
  category: z.enum(COMPLAINT_CATEGORIES).default("MAINTENANCE"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  assignedTo: z.number().optional(),
  resolution: z.string().optional(),
});
