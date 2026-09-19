"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flats = exports.FLAT_TYPES = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.FLAT_TYPES = [
    "1BHK",
    "2BHK",
    "3BHK",
    "4BHK",
    "STUDIO",
    "PENTHOUSE",
    "OTHER",
];
exports.flats = (0, mysql_core_1.mysqlTable)("flats", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    societyId: (0, mysql_core_1.int)("society_id").notNull(),
    blockId: (0, mysql_core_1.int)("block_id").notNull(),
    floorId: (0, mysql_core_1.int)("floor_id").notNull(),
    flatNumber: (0, mysql_core_1.varchar)("flat_number", { length: 50 }).notNull().unique(),
    flatType: (0, mysql_core_1.mysqlEnum)("flat_type", exports.FLAT_TYPES).default("2BHK").notNull(),
    areaSqft: (0, mysql_core_1.decimal)("area_sqft", { precision: 10, scale: 2 }).default("1200.00").notNull(),
    bedrooms: (0, mysql_core_1.int)("bedrooms").default(2).notNull(),
    bathrooms: (0, mysql_core_1.int)("bathrooms").default(2).notNull(),
    occupancyStatus: (0, mysql_core_1.mysqlEnum)("occupancy_status", [
        "VACANT",
        "OCCUPIED",
        "UNDER_MAINTENANCE",
    ]).default("VACANT").notNull(),
    ownershipStatus: (0, mysql_core_1.mysqlEnum)("ownership_status", [
        "OWNER_OCCUPIED",
        "TENANT_OCCUPIED",
        "VACANT",
    ]).default("VACANT").notNull(),
    monthlyMaintenance: (0, mysql_core_1.decimal)("monthly_maintenance", { precision: 10, scale: 2 })
        .notNull()
        .default("3000.00"),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    flatSocietyIdx: (0, mysql_core_1.index)("flat_society_idx").on(table.societyId),
    flatBlockIdx: (0, mysql_core_1.index)("flat_block_idx").on(table.blockId),
    flatFloorIdx: (0, mysql_core_1.index)("flat_floor_idx").on(table.floorId),
    flatOccupancyIdx: (0, mysql_core_1.index)("flat_occupancy_idx").on(table.occupancyStatus),
}));
