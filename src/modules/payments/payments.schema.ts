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

export const payments = mysqlTable(
  "payments",
  {
    id: int("id").primaryKey().autoincrement(),
    societyId: int("society_id").default(1).notNull(),
    flatId: int("flat_id"),
    residentId: int("resident_id"),
    userId: int("user_id").notNull(),
    roomId: int("room_id"),
    stayId: int("stay_id"),
    monthlyBillId: int("monthly_bill_id"),
    maintenanceBillId: int("maintenance_bill_id"),
    billingMonth: int("billing_month").notNull(),
    billingYear: int("billing_year").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paymentDate: date("payment_date", { mode: "string" }).notNull(),
    paymentMethod: mysqlEnum("payment_method", [
      "CASH",
      "UPI",
      "BANK_TRANSFER",
      "CARD",
      "CHEQUE",
      "OTHER",
    ]).default("CASH").notNull(),
    transactionId: varchar("transaction_id", { length: 100 }),
    receiptNumber: varchar("receipt_number", { length: 100 }).notNull().unique(),
    status: mysqlEnum("status", [
      "PAID",
      "PENDING",
      "PARTIAL",
      "REFUNDED",
      "CANCELLED",
    ]).default("PAID").notNull(),
    previousPending: decimal("previous_pending", { precision: 10, scale: 2 }).default("0.00").notNull(),
    remainingPending: decimal("remaining_pending", { precision: 10, scale: 2 }).default("0.00").notNull(),
    remarks: text("remarks"),
    createdBy: int("created_by").notNull(),
    verifiedBy: int("verified_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("payment_user_id_idx").on(table.userId),
    flatIdIdx: index("payment_flat_id_idx").on(table.flatId),
    residentIdIdx: index("payment_resident_id_idx").on(table.residentId),
    paymentDateIdx: index("payment_date_idx").on(table.paymentDate),
    receiptNumberIdx: index("receipt_number_idx").on(table.receiptNumber),
  })
);

export const paymentAllocations = mysqlTable(
  "payment_allocations",
  {
    id: int("id").primaryKey().autoincrement(),
    paymentId: int("payment_id").notNull(),
    monthlyBillId: int("monthly_bill_id"),
    maintenanceBillId: int("maintenance_bill_id"),
    allocatedAmount: decimal("allocated_amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    paymentIdIdx: index("alloc_payment_id_idx").on(table.paymentId),
    monthlyBillIdIdx: index("alloc_monthly_bill_id_idx").on(table.monthlyBillId),
  })
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type PaymentAllocation = typeof paymentAllocations.$inferSelect;
export type NewPaymentAllocation = typeof paymentAllocations.$inferInsert;
