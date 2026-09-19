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

export const ROOM_TYPES = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "Penthouse",
  "Studio",
  "Shop / Commercial",
  "Other",
] as const;

export const rooms = mysqlTable(
  "rooms",
  {
    id: int("id").primaryKey().autoincrement(),
    roomNumber: varchar("room_number", { length: 50 }).notNull().unique(),
    floor: int("floor").notNull().default(1),
    roomType: mysqlEnum("room_type", ROOM_TYPES).default("1 BHK").notNull(),
    capacity: int("capacity").notNull().default(1),
    monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
    securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).default("0.00").notNull(),
    status: mysqlEnum("status", [
      "AVAILABLE",
      "OCCUPIED",
      "PARTIALLY_OCCUPIED",
      "MAINTENANCE",
      "INACTIVE",
    ]).default("AVAILABLE").notNull(),
    description: text("description"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    roomNumberIdx: index("room_number_idx").on(table.roomNumber),
    statusIdx: index("room_status_idx").on(table.status),
    floorIdx: index("floor_idx").on(table.floor),
  })
);

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
