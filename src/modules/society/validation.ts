import { z } from "zod";

export const updateSocietySchema = z.object({
  name: z.string().min(2).optional(),
  registrationNumber: z.string().optional(),
  address: z.string().min(5).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  maintenanceDueDay: z.number().min(1).max(31).optional(),
  lateFee: z.number().min(0).optional(),
  logo: z.string().optional(),
});

export const createBlockSchema = z
  .object({
    name: z.string().min(2, "Tower name required"),
    code: z.string().min(1).optional(),
    blockCode: z.string().min(1).optional(),
    numberOfFloors: z.number().min(1).optional(),
    totalFloors: z.number().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((data) => Boolean(data.code || data.blockCode), {
    message: "Tower code is required",
    path: ["code"],
  });

export const updateBlockSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(1).optional(),
  blockCode: z.string().min(1).optional(),
  numberOfFloors: z.number().min(1).optional(),
  totalFloors: z.number().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const createFloorSchema = z.object({
  blockId: z.number(),
  floorNumber: z.number(),
  name: z.string().min(1),
});
