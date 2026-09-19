"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyBills = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.monthlyBills = (0, mysql_core_1.mysqlTable)("monthly_bills", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    stayId: (0, mysql_core_1.int)("stay_id").notNull(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    roomId: (0, mysql_core_1.int)("room_id").notNull(),
    billingMonth: (0, mysql_core_1.int)("billing_month").notNull(), // 1 to 12
    billingYear: (0, mysql_core_1.int)("billing_year").notNull(), // e.g. 2026
    billAmount: (0, mysql_core_1.decimal)("bill_amount", { precision: 10, scale: 2 }).notNull(),
    paidAmount: (0, mysql_core_1.decimal)("paid_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    pendingAmount: (0, mysql_core_1.decimal)("pending_amount", { precision: 10, scale: 2 }).notNull(),
    dueDate: (0, mysql_core_1.date)("due_date", { mode: "string" }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["PENDING", "PARTIAL", "PAID"]).default("PENDING").notNull(),
    isProrated: (0, mysql_core_1.boolean)("is_prorated").default(false).notNull(),
    proratedDays: (0, mysql_core_1.int)("prorated_days"),
    remarks: (0, mysql_core_1.text)("remarks"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    stayMonthYearUnique: (0, mysql_core_1.uniqueIndex)("stay_month_year_uniq").on(table.stayId, table.billingMonth, table.billingYear),
    userIdIdx: (0, mysql_core_1.index)("bill_user_id_idx").on(table.userId),
    roomIdIdx: (0, mysql_core_1.index)("bill_room_id_idx").on(table.roomId),
    billingMonthIdx: (0, mysql_core_1.index)("billing_month_idx").on(table.billingMonth),
    billingYearIdx: (0, mysql_core_1.index)("billing_year_idx").on(table.billingYear),
    statusIdx: (0, mysql_core_1.index)("bill_status_idx").on(table.status),
}));
