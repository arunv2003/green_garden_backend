import { z } from "zod";

export const createAccountantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  role: z.enum(["ACCOUNTANT", "SECRETARY"]).default("ACCOUNTANT").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  fatherHusbandName: z.string().optional(),
  address: z.string().optional(),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const updateAccountantSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  mobile: z.string().min(10).optional(),
  role: z.enum(["ACCOUNTANT", "SECRETARY"]).optional(),
  password: z.string().min(6).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  fatherHusbandName: z.string().optional(),
  address: z.string().optional(),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const changeSecretarySchema = z.object({
  id: z.number().optional(), // Existing secretary ID to update
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  fatherHusbandName: z.string().optional(),
  address: z.string().optional(),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  mode: z.enum(["UPDATE", "REPLACE_NEW"]).default("UPDATE"), // UPDATE existing or REPLACE with new secretary
});
