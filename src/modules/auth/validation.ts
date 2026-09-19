import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Mobile is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateProfileSchema = z.object({
  mobile: z.string().min(10, "Mobile number must be at least 10 digits").optional(),
  fatherHusbandName: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

