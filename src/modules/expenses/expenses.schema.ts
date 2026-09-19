import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  date,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const EXPENSE_CATEGORIES = [
  "ELECTRICITY",
  "WATER",
  "SECURITY",
  "CLEANING",
  "STAFF_SALARY",
  "REPAIR",
  "LIFT",
  "GARDEN",
  "OTHER",
] as const;

export const expenses = mysqlTable(
  "expenses",
  {
    id: int("id").primaryKey().autoincrement(),
    societyId: int("society_id").notNull(),
    category: mysqlEnum("category", EXPENSE_CATEGORIES).default("OTHER").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    expenseDate: date("expense_date", { mode: "string" }).notNull(),
    paymentMethod: mysqlEnum("payment_method", [
      "CASH",
      "UPI",
      "BANK_TRANSFER",
      "CARD",
      "CHEQUE",
      "OTHER",
    ]).default("BANK_TRANSFER").notNull(),
    vendor: varchar("vendor", { length: 255 }),
    description: text("description"),
    receiptUrl: text("receipt_url"),
    createdBy: int("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    expenseSocietyIdx: index("expense_society_idx").on(table.societyId),
    expenseCategoryIdx: index("expense_category_idx").on(table.category),
    expenseDateIdx: index("expense_date_idx").on(table.expenseDate),
  })
);

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
