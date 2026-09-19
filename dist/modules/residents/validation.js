"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVehicleSchema = exports.createFamilyMemberSchema = exports.moveOutSchema = exports.updateResidentSchema = exports.createResidentSchema = void 0;
const zod_1 = require("zod");
exports.createResidentSchema = zod_1.z
    .object({
    userId: zod_1.z.number().optional(), // Existing user ID if linking
    flatId: zod_1.z.coerce.number({ required_error: "Flat selection is required" }),
    residentType: zod_1.z.enum(["OWNER", "TENANT", "FAMILY_MEMBER"]).default("TENANT"),
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters").optional(),
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
    mobile: zod_1.z.string().min(10, "Valid 10-digit mobile required").optional(),
    phone: zod_1.z.string().min(10, "Valid 10-digit mobile required").optional(),
    email: zod_1.z.string().email("Valid email required").optional().or(zod_1.z.literal("")),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
    dateOfBirth: zod_1.z.string().optional(),
    idProofType: zod_1.z.string().default("Aadhaar Card"),
    idProofNumber: zod_1.z.string().optional(),
    moveInDate: zod_1.z.string().default(() => new Date().toISOString().slice(0, 10)),
    password: zod_1.z.string().min(6).optional(),
    emergencyContactName: zod_1.z.string().optional(),
    emergencyContactPhone: zod_1.z.string().optional(),
})
    .refine((data) => !!(data.fullName || data.name), {
    message: "Full name is required",
    path: ["fullName"],
})
    .refine((data) => !!(data.mobile || data.phone), {
    message: "Valid mobile number is required",
    path: ["mobile"],
});
exports.updateResidentSchema = zod_1.z.object({
    residentType: zod_1.z.enum(["OWNER", "TENANT", "FAMILY_MEMBER"]).optional(),
    fullName: zod_1.z.string().min(2).optional(),
    name: zod_1.z.string().min(2).optional(),
    mobile: zod_1.z.string().min(10).optional(),
    phone: zod_1.z.string().min(10).optional(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    dateOfBirth: zod_1.z.string().optional(),
    idProofType: zod_1.z.string().optional(),
    idProofNumber: zod_1.z.string().optional(),
    moveInDate: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional(),
    emergencyContactName: zod_1.z.string().optional(),
    emergencyContactPhone: zod_1.z.string().optional(),
});
exports.moveOutSchema = zod_1.z.object({
    moveOutDate: zod_1.z.string().default(() => new Date().toISOString().slice(0, 10)),
    reason: zod_1.z.string().optional(),
});
exports.createFamilyMemberSchema = zod_1.z.object({
    residentId: zod_1.z.coerce.number({ required_error: "Resident ID required" }),
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    relationship: zod_1.z.string().min(1, "Relationship required"),
    age: zod_1.z.coerce.number().optional(),
    mobile: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
});
exports.createVehicleSchema = zod_1.z.object({
    residentId: zod_1.z.coerce.number().optional(),
    flatId: zod_1.z.coerce.number().optional(),
    vehicleType: zod_1.z.enum(["CAR", "BIKE", "SCOOTER", "OTHER"]).default("CAR"),
    vehicleNumber: zod_1.z.string().min(3, "Vehicle registration number required"),
    brand: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    parkingSlot: zod_1.z.string().optional(),
    slotNumber: zod_1.z.string().optional(),
});
