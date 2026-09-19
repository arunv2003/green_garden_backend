"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stays = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.stays = (0, mysql_core_1.mysqlTable)("stays", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    roomId: (0, mysql_core_1.int)("room_id").notNull(),
    checkInDate: (0, mysql_core_1.date)("check_in_date", { mode: "string" }).notNull(),
    checkInTime: (0, mysql_core_1.time)("check_in_time").notNull(),
    checkOutDate: (0, mysql_core_1.date)("check_out_date", { mode: "string" }),
    checkOutTime: (0, mysql_core_1.time)("check_out_time"),
    monthlyRent: (0, mysql_core_1.decimal)("monthly_rent", { precision: 10, scale: 2 }).notNull(),
    securityDeposit: (0, mysql_core_1.decimal)("security_deposit", { precision: 10, scale: 2 }).default("0.00").notNull(),
    initialPending: (0, mysql_core_1.decimal)("initial_pending", { precision: 10, scale: 2 }).default("0.00").notNull(),
    finalPending: (0, mysql_core_1.decimal)("final_pending", { precision: 10, scale: 2 }),
    securityDepositAdjustment: (0, mysql_core_1.decimal)("security_deposit_adjustment", { precision: 10, scale: 2 }).default("0.00"),
    checkOutReason: (0, mysql_core_1.varchar)("check_out_reason", { length: 255 }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE").notNull(),
    remarks: (0, mysql_core_1.text)("remarks"),
    startingMeter: (0, mysql_core_1.varchar)("starting_meter", { length: 100 }),
    createdBy: (0, mysql_core_1.int)("created_by"),
    checkedOutBy: (0, mysql_core_1.int)("checked_out_by"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    userIdIdx: (0, mysql_core_1.index)("stay_user_id_idx").on(table.userId),
    roomIdIdx: (0, mysql_core_1.index)("stay_room_id_idx").on(table.roomId),
    statusIdx: (0, mysql_core_1.index)("stay_status_idx").on(table.status),
    checkInDateIdx: (0, mysql_core_1.index)("stay_checkin_idx").on(table.checkInDate),
}));
