"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitors = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.visitors = (0, mysql_core_1.mysqlTable)("visitors", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    societyId: (0, mysql_core_1.int)("society_id").notNull(),
    flatId: (0, mysql_core_1.int)("flat_id").notNull(),
    invitedBy: (0, mysql_core_1.int)("invited_by"),
    visitorName: (0, mysql_core_1.varchar)("visitor_name", { length: 255 }).notNull(),
    mobile: (0, mysql_core_1.varchar)("mobile", { length: 50 }).notNull(),
    purpose: (0, mysql_core_1.varchar)("purpose", { length: 255 }),
    vehicleNumber: (0, mysql_core_1.varchar)("vehicle_number", { length: 50 }),
    entryDate: (0, mysql_core_1.date)("entry_date", { mode: "string" }).notNull(),
    entryTime: (0, mysql_core_1.time)("entry_time").notNull(),
    exitDate: (0, mysql_core_1.date)("exit_date", { mode: "string" }),
    exitTime: (0, mysql_core_1.time)("exit_time"),
    status: (0, mysql_core_1.mysqlEnum)("status", ["EXPECTED", "INSIDE", "EXITED", "REJECTED"])
        .default("INSIDE")
        .notNull(),
    approvedBy: (0, mysql_core_1.int)("approved_by"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    visitorFlatIdx: (0, mysql_core_1.index)("visitor_flat_idx").on(table.flatId),
    visitorStatusIdx: (0, mysql_core_1.index)("visitor_status_idx").on(table.status),
    visitorDateIdx: (0, mysql_core_1.index)("visitor_date_idx").on(table.entryDate),
}));
