"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceBills = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.maintenanceBills = (0, mysql_core_1.mysqlTable)("maintenance_bills", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    societyId: (0, mysql_core_1.int)("society_id").notNull(),
    flatId: (0, mysql_core_1.int)("flat_id").notNull(),
    residentId: (0, mysql_core_1.int)("resident_id"),
    billingMonth: (0, mysql_core_1.int)("billing_month").notNull(), // 1 to 12
    billingYear: (0, mysql_core_1.int)("billing_year").notNull(),
    baseAmount: (0, mysql_core_1.decimal)("base_amount", { precision: 10, scale: 2 }).notNull(),
    additionalCharges: (0, mysql_core_1.decimal)("additional_charges", { precision: 10, scale: 2 })
        .default("0.00")
        .notNull(),
    lateFee: (0, mysql_core_1.decimal)("late_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
    discount: (0, mysql_core_1.decimal)("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalAmount: (0, mysql_core_1.decimal)("total_amount", { precision: 10, scale: 2 }).notNull(),
    paidAmount: (0, mysql_core_1.decimal)("paid_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    pendingAmount: (0, mysql_core_1.decimal)("pending_amount", { precision: 10, scale: 2 }).notNull(),
    dueDate: (0, mysql_core_1.date)("due_date", { mode: "string" }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"])
        .default("UNPAID")
        .notNull(),
    remarks: (0, mysql_core_1.text)("remarks"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    flatMonthYearUniq: (0, mysql_core_1.uniqueIndex)("flat_month_year_uniq").on(table.flatId, table.billingMonth, table.billingYear),
    mbSocietyIdx: (0, mysql_core_1.index)("mb_society_idx").on(table.societyId),
    mbFlatIdx: (0, mysql_core_1.index)("mb_flat_idx").on(table.flatId),
    mbResidentIdx: (0, mysql_core_1.index)("mb_resident_idx").on(table.residentId),
    mbMonthIdx: (0, mysql_core_1.index)("mb_month_idx").on(table.billingMonth),
    mbYearIdx: (0, mysql_core_1.index)("mb_year_idx").on(table.billingYear),
    mbStatusIdx: (0, mysql_core_1.index)("mb_status_idx").on(table.status),
}));
