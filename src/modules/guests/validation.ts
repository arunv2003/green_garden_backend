import { z } from "zod";

export const createGuestSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  mobile: z.string().min(10, "Mobile must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters").default("User@123"),
  fatherHusbandName: z.string().optional(),
  address: z.string().optional(),
  idProofType: z.string().default("Aadhaar Card"),
  idProofNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  joiningDate: z.string().optional(),
  profilePhoto: z.string().optional(),
  idProofDocument: z.string().optional(),
  role: z.enum(["USER", "SECRETARY", "ACCOUNTANT"]).default("USER"),
});

export const updateGuestSchema = createGuestSchema.partial();
