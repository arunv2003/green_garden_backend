"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.rooms = (0, mysql_core_1.mysqlTable)("rooms", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    roomNumber: (0, mysql_core_1.varchar)("room_number", { length: 50 }).notNull().unique(),
    floor: (0, mysql_core_1.int)("floor").notNull().default(1),
    roomType: (0, mysql_core_1.mysqlEnum)("room_type", [
        "SINGLE",
        "DOUBLE",
        "TRIPLE",
        "SUITE",
        "DORMITORY",
    ]).default("SINGLE").notNull(),
    capacity: (0, mysql_core_1.int)("capacity").notNull().default(1),
    monthlyRent: (0, mysql_core_1.decimal)("monthly_rent", { precision: 10, scale: 2 }).notNull(),
    securityDeposit: (0, mysql_core_1.decimal)("security_deposit", { precision: 10, scale: 2 }).default("0.00").notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", [
        "AVAILABLE",
        "OCCUPIED",
        "PARTIALLY_OCCUPIED",
        "MAINTENANCE",
        "INACTIVE",
    ]).default("AVAILABLE").notNull(),
    description: (0, mysql_core_1.text)("description"),
    deletedAt: (0, mysql_core_1.timestamp)("deleted_at"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    roomNumberIdx: (0, mysql_core_1.index)("room_number_idx").on(table.roomNumber),
    statusIdx: (0, mysql_core_1.index)("room_status_idx").on(table.status),
    floorIdx: (0, mysql_core_1.index)("floor_idx").on(table.floor),
}));
