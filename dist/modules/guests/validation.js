"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGuestSchema = exports.createGuestSchema = void 0;
const zod_1 = require("zod");
exports.createGuestSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Full Name must be at least 2 characters"),
    email: zod_1.z.string().email("Valid email is required"),
    mobile: zod_1.z.string().min(10, "Mobile must be at least 10 digits"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").default("User@123"),
    fatherHusbandName: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    idProofType: zod_1.z.string().default("Aadhaar Card"),
    idProofNumber: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
    joiningDate: zod_1.z.string().optional(),
    profilePhoto: zod_1.z.string().optional(),
    idProofDocument: zod_1.z.string().optional(),
    role: zod_1.z.enum(["USER", "SECRETARY", "ACCOUNTANT"]).default("USER"),
});
exports.updateGuestSchema = exports.createGuestSchema.partial();
