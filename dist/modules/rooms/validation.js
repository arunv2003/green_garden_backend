"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoomSchema = exports.createRoomSchema = exports.ROOM_TYPES = void 0;
const zod_1 = require("zod");
exports.ROOM_TYPES = [
    "1 BHK",
    "2 BHK",
    "3 BHK",
    "4 BHK",
    "Penthouse",
    "Studio",
    "Shop / Commercial",
    "Other",
];
exports.createRoomSchema = zod_1.z.object({
    roomNumber: zod_1.z.string().min(1, "Room number is required"),
    floor: zod_1.z.coerce.number().int().min(0, "Floor must be 0 or higher"),
    roomType: zod_1.z.enum(exports.ROOM_TYPES).default("1 BHK"),
    capacity: zod_1.z.coerce.number().int().min(1, "Capacity must be at least 1"),
    monthlyRent: zod_1.z.coerce.number().positive("Monthly rent must be positive"),
    securityDeposit: zod_1.z.coerce.number().min(0).default(0),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(["AVAILABLE", "OCCUPIED", "PARTIALLY_OCCUPIED", "MAINTENANCE", "INACTIVE"]).default("AVAILABLE"),
});
exports.updateRoomSchema = exports.createRoomSchema.partial();
