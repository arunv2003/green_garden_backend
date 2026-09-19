import { z } from "zod";

export const createResidentSchema = z
  .object({
    userId: z.number().optional(), // Existing user ID if linking
    flatId: z.coerce.number({ required_error: "Flat selection is required" }),
    residentType: z.enum(["OWNER", "TENANT", "FAMILY_MEMBER"]).default("TENANT"),
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    mobile: z.string().min(10, "Valid 10-digit mobile required").optional(),
    phone: z.string().min(10, "Valid 10-digit mobile required").optional(),
    email: z.string().email("Valid email required").optional().or(z.literal("")),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
    dateOfBirth: z.string().optional(),
    idProofType: z.string().default("Aadhaar Card"),
    idProofNumber: z.string().optional(),
    moveInDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
    password: z.string().min(6).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
  })
  .refine((data) => !!(data.fullName || data.name), {
    message: "Full name is required",
    path: ["fullName"],
  })
  .refine((data) => !!(data.mobile || data.phone), {
    message: "Valid mobile number is required",
    path: ["mobile"],
  });

export const updateResidentSchema = z.object({
  residentType: z.enum(["OWNER", "TENANT", "FAMILY_MEMBER"]).optional(),
  fullName: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  mobile: z.string().min(10).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
  moveInDate: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export const moveOutSchema = z.object({
  moveOutDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  reason: z.string().optional(),
});

export const createFamilyMemberSchema = z.object({
  residentId: z.coerce.number({ required_error: "Resident ID required" }),
  name: z.string().min(2, "Name must be at least 2 characters"),
  relationship: z.string().min(1, "Relationship required"),
  age: z.coerce.number().optional(),
  mobile: z.string().optional(),
  phone: z.string().optional(),
});

export const createVehicleSchema = z.object({
  residentId: z.coerce.number().optional(),
  flatId: z.coerce.number().optional(),
  vehicleType: z.enum(["CAR", "BIKE", "SCOOTER", "OTHER"]).default("CAR"),
  vehicleNumber: z.string().min(3, "Vehicle registration number required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  parkingSlot: z.string().optional(),
  slotNumber: z.string().optional(),
});
