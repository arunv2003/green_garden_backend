import {
  mysqlTable,
  int,
  text,
  decimal,
  date,
  timestamp,
  mysqlEnum,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const monthlyBills = mysqlTable(
  "monthly_bills",
  {
    id: int("id").primaryKey().autoincrement(),
    stayId: int("stay_id").notNull(),
    userId: int("user_id").notNull(),
    roomId: int("room_id").notNull(),
    billingMonth: int("billing_month").notNull(), // 1 to 12
    billingYear: int("billing_year").notNull(), // e.g. 2026
    billAmount: decimal("bill_amount", { precision: 10, scale: 2 }).notNull(),
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    pendingAmount: decimal("pending_amount", { precision: 10, scale: 2 }).notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    status: mysqlEnum("status", ["PENDING", "PARTIAL", "PAID"]).default("PENDING").notNull(),
    isProrated: boolean("is_prorated").default(false).notNull(),
    proratedDays: int("prorated_days"),
    remarks: text("remarks"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    stayMonthYearUnique: uniqueIndex("stay_month_year_uniq").on(
      table.stayId,
      table.billingMonth,
      table.billingYear
    ),
    userIdIdx: index("bill_user_id_idx").on(table.userId),
    roomIdIdx: index("bill_room_id_idx").on(table.roomId),
    billingMonthIdx: index("billing_month_idx").on(table.billingMonth),
    billingYearIdx: index("billing_year_idx").on(table.billingYear),
    statusIdx: index("bill_status_idx").on(table.status),
  })
);

export type MonthlyBill = typeof monthlyBills.$inferSelect;
export type NewMonthlyBill = typeof monthlyBills.$inferInsert;
