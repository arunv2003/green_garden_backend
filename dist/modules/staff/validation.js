"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeSecretarySchema = exports.updateAccountantSchema = exports.createAccountantSchema = void 0;
const zod_1 = require("zod");
exports.createAccountantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Valid email is required"),
    mobile: zod_1.z.string().min(10, "Mobile number must be at least 10 digits"),
    role: zod_1.z.enum(["ACCOUNTANT", "SECRETARY"]).default("ACCOUNTANT").optional(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").optional(),
    fatherHusbandName: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    idProofType: zod_1.z.string().optional(),
    idProofNumber: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
});
exports.updateAccountantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    mobile: zod_1.z.string().min(10).optional(),
    role: zod_1.z.enum(["ACCOUNTANT", "SECRETARY"]).optional(),
    password: zod_1.z.string().min(6).optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional(),
    fatherHusbandName: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    idProofType: zod_1.z.string().optional(),
    idProofNumber: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
});
exports.changeSecretarySchema = zod_1.z.object({
    id: zod_1.z.number().optional(), // Existing secretary ID to update
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Valid email is required"),
    mobile: zod_1.z.string().min(10, "Mobile number must be at least 10 digits"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").optional(),
    fatherHusbandName: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    idProofType: zod_1.z.string().optional(),
    idProofNumber: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
    mode: zod_1.z.enum(["UPDATE", "REPLACE_NEW"]).default("UPDATE"), // UPDATE existing or REPLACE with new secretary
});
