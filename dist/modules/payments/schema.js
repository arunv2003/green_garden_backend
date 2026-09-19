"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentAllocations = exports.payments = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.payments = (0, mysql_core_1.mysqlTable)("payments", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    roomId: (0, mysql_core_1.int)("room_id").notNull(),
    stayId: (0, mysql_core_1.int)("stay_id").notNull(),
    monthlyBillId: (0, mysql_core_1.int)("monthly_bill_id"),
    billingMonth: (0, mysql_core_1.int)("billing_month").notNull(),
    billingYear: (0, mysql_core_1.int)("billing_year").notNull(),
    amount: (0, mysql_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    paymentDate: (0, mysql_core_1.date)("payment_date", { mode: "string" }).notNull(),
    paymentMethod: (0, mysql_core_1.mysqlEnum)("payment_method", [
        "CASH",
        "UPI",
        "BANK_TRANSFER",
        "CARD",
        "OTHER",
    ]).default("CASH").notNull(),
    transactionId: (0, mysql_core_1.varchar)("transaction_id", { length: 100 }),
    receiptNumber: (0, mysql_core_1.varchar)("receipt_number", { length: 100 }).notNull().unique(),
    status: (0, mysql_core_1.mysqlEnum)("status", [
        "PAID",
        "PENDING",
        "PARTIAL",
        "REFUNDED",
        "CANCELLED",
    ]).default("PAID").notNull(),
    previousPending: (0, mysql_core_1.decimal)("previous_pending", { precision: 10, scale: 2 }).default("0.00").notNull(),
    remainingPending: (0, mysql_core_1.decimal)("remaining_pending", { precision: 10, scale: 2 }).default("0.00").notNull(),
    remarks: (0, mysql_core_1.text)("remarks"),
    createdBy: (0, mysql_core_1.int)("created_by").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    userIdIdx: (0, mysql_core_1.index)("payment_user_id_idx").on(table.userId),
    roomIdIdx: (0, mysql_core_1.index)("payment_room_id_idx").on(table.roomId),
    stayIdIdx: (0, mysql_core_1.index)("payment_stay_id_idx").on(table.stayId),
    paymentDateIdx: (0, mysql_core_1.index)("payment_date_idx").on(table.paymentDate),
    receiptNumberIdx: (0, mysql_core_1.index)("receipt_number_idx").on(table.receiptNumber),
}));
exports.paymentAllocations = (0, mysql_core_1.mysqlTable)("payment_allocations", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    paymentId: (0, mysql_core_1.int)("payment_id").notNull(),
    monthlyBillId: (0, mysql_core_1.int)("monthly_bill_id").notNull(),
    allocatedAmount: (0, mysql_core_1.decimal)("allocated_amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    paymentIdIdx: (0, mysql_core_1.index)("alloc_payment_id_idx").on(table.paymentId),
    monthlyBillIdIdx: (0, mysql_core_1.index)("alloc_monthly_bill_id_idx").on(table.monthlyBillId),
}));
