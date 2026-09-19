import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  date,
  time,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const stays = mysqlTable(
  "stays",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull(),
    roomId: int("room_id").notNull(),
    checkInDate: date("check_in_date", { mode: "string" }).notNull(),
    checkInTime: time("check_in_time").notNull(),
    checkOutDate: date("check_out_date", { mode: "string" }),
    checkOutTime: time("check_out_time"),
    monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
    securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).default("0.00").notNull(),
    initialPending: decimal("initial_pending", { precision: 10, scale: 2 }).default("0.00").notNull(),
    finalPending: decimal("final_pending", { precision: 10, scale: 2 }),
    securityDepositAdjustment: decimal("security_deposit_adjustment", { precision: 10, scale: 2 }).default("0.00"),
    checkOutReason: varchar("check_out_reason", { length: 255 }),
    status: mysqlEnum("status", ["ACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE").notNull(),
    remarks: text("remarks"),
    startingMeter: varchar("starting_meter", { length: 100 }),
    createdBy: int("created_by"),
    checkedOutBy: int("checked_out_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("stay_user_id_idx").on(table.userId),
    roomIdIdx: index("stay_room_id_idx").on(table.roomId),
    statusIdx: index("stay_status_idx").on(table.status),
    checkInDateIdx: index("stay_checkin_idx").on(table.checkInDate),
  })
);

export type Stay = typeof stays.$inferSelect;
export type NewStay = typeof stays.$inferInsert;
