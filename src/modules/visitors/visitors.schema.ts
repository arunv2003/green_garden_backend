import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  time,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const visitors = mysqlTable(
  "visitors",
  {
    id: int("id").primaryKey().autoincrement(),
    societyId: int("society_id").notNull(),
    flatId: int("flat_id").notNull(),
    invitedBy: int("invited_by"),
    visitorName: varchar("visitor_name", { length: 255 }).notNull(),
    mobile: varchar("mobile", { length: 50 }).notNull(),
    purpose: varchar("purpose", { length: 255 }),
    vehicleNumber: varchar("vehicle_number", { length: 50 }),
    entryDate: date("entry_date", { mode: "string" }).notNull(),
    entryTime: time("entry_time").notNull(),
    exitDate: date("exit_date", { mode: "string" }),
    exitTime: time("exit_time"),
    status: mysqlEnum("status", ["EXPECTED", "INSIDE", "EXITED", "REJECTED"])
      .default("INSIDE")
      .notNull(),
    approvedBy: int("approved_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    visitorFlatIdx: index("visitor_flat_idx").on(table.flatId),
    visitorStatusIdx: index("visitor_status_idx").on(table.status),
    visitorDateIdx: index("visitor_date_idx").on(table.entryDate),
  })
);

export type Visitor = typeof visitors.$inferSelect;
export type NewVisitor = typeof visitors.$inferInsert;
