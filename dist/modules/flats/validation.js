"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFlatSchema = exports.createFlatSchema = void 0;
const zod_1 = require("zod");
const flats_schema_js_1 = require("./flats.schema.js");
exports.createFlatSchema = zod_1.z.object({
    societyId: zod_1.z.number().default(1),
    blockId: zod_1.z.number({ required_error: "Block/Tower selection is required" }),
    floorId: zod_1.z.number({ required_error: "Floor selection is required" }),
    flatNumber: zod_1.z.string().min(1, "Flat number is required"),
    flatType: zod_1.z.enum(flats_schema_js_1.FLAT_TYPES).default("2BHK"),
    areaSqft: zod_1.z.number().min(100).default(1200),
    bedrooms: zod_1.z.number().min(1).default(2),
    bathrooms: zod_1.z.number().min(1).default(2),
    monthlyMaintenance: zod_1.z.number().min(0).default(3000),
    occupancyStatus: zod_1.z.enum(["VACANT", "OCCUPIED", "UNDER_MAINTENANCE"]).default("VACANT"),
    ownershipStatus: zod_1.z.enum(["OWNER_OCCUPIED", "TENANT_OCCUPIED", "VACANT"]).default("VACANT"),
});
exports.updateFlatSchema = exports.createFlatSchema.partial();
