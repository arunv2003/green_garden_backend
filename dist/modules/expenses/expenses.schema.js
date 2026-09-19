"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenses = exports.EXPENSE_CATEGORIES = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.EXPENSE_CATEGORIES = [
    "ELECTRICITY",
    "WATER",
    "SECURITY",
    "CLEANING",
    "STAFF_SALARY",
    "REPAIR",
    "LIFT",
    "GARDEN",
    "OTHER",
];
exports.expenses = (0, mysql_core_1.mysqlTable)("expenses", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    societyId: (0, mysql_core_1.int)("society_id").notNull(),
    category: (0, mysql_core_1.mysqlEnum)("category", exports.EXPENSE_CATEGORIES).default("OTHER").notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    amount: (0, mysql_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    expenseDate: (0, mysql_core_1.date)("expense_date", { mode: "string" }).notNull(),
    paymentMethod: (0, mysql_core_1.mysqlEnum)("payment_method", [
        "CASH",
        "UPI",
        "BANK_TRANSFER",
        "CARD",
        "CHEQUE",
        "OTHER",
    ]).default("BANK_TRANSFER").notNull(),
    vendor: (0, mysql_core_1.varchar)("vendor", { length: 255 }),
    description: (0, mysql_core_1.text)("description"),
    receiptUrl: (0, mysql_core_1.text)("receipt_url"),
    createdBy: (0, mysql_core_1.int)("created_by").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    expenseSocietyIdx: (0, mysql_core_1.index)("expense_society_idx").on(table.societyId),
    expenseCategoryIdx: (0, mysql_core_1.index)("expense_category_idx").on(table.category),
    expenseDateIdx: (0, mysql_core_1.index)("expense_date_idx").on(table.expenseDate),
}));
