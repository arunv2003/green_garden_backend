import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

// 1. Societies Master Table
export const societies = mysqlTable(
  "societies",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    pincode: varchar("pincode", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    maintenanceDueDay: int("maintenance_due_day").default(10).notNull(),
    lateFee: decimal("late_fee", { precision: 10, scale: 2 }).default("200.00").notNull(),
    logo: text("logo"),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }
);

// 2. Blocks / Towers Table
export const blocks = mysqlTable(
  "blocks",
  {
    id: int("id").primaryKey().autoincrement(),
    societyId: int("society_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 20 }).notNull(),
    numberOfFloors: int("number_of_floors").default(5).notNull(),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    societyIdx: index("block_society_idx").on(table.societyId),
  })
);

// 3. Floors Table
export const floors = mysqlTable(
  "floors",
  {
    id: int("id").primaryKey().autoincrement(),
    blockId: int("block_id").notNull(),
    floorNumber: int("floor_number").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    blockIdx: index("floor_block_idx").on(table.blockId),
  })
);

export type Society = typeof societies.$inferSelect;
export type NewSociety = typeof societies.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
export type Floor = typeof floors.$inferSelect;
export type NewFloor = typeof floors.$inferInsert;
