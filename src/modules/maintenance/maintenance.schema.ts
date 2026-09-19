import {
  mysqlTable,
  int,
  text,
  decimal,
  date,
  timestamp,
  mysqlEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

export const maintenanceBills = mysqlTable(
  "maintenance_bills",
  {
    id: int("id").primaryKey().autoincrement(),
    societyId: int("society_id").notNull(),
    flatId: int("flat_id").notNull(),
    residentId: int("resident_id"),
    billingMonth: int("billing_month").notNull(), // 1 to 12
    billingYear: int("billing_year").notNull(),
    baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
    additionalCharges: decimal("additional_charges", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    lateFee: decimal("late_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
    discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    pendingAmount: decimal("pending_amount", { precision: 10, scale: 2 }).notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    status: mysqlEnum("status", ["UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"])
      .default("UNPAID")
      .notNull(),
    remarks: text("remarks"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    flatMonthYearUniq: uniqueIndex("flat_month_year_uniq").on(
      table.flatId,
      table.billingMonth,
      table.billingYear
    ),
    mbSocietyIdx: index("mb_society_idx").on(table.societyId),
    mbFlatIdx: index("mb_flat_idx").on(table.flatId),
    mbResidentIdx: index("mb_resident_idx").on(table.residentId),
    mbMonthIdx: index("mb_month_idx").on(table.billingMonth),
    mbYearIdx: index("mb_year_idx").on(table.billingYear),
    mbStatusIdx: index("mb_status_idx").on(table.status),
  })
);

export type MaintenanceBill = typeof maintenanceBills.$inferSelect;
export type NewMaintenanceBill = typeof maintenanceBills.$inferInsert;
