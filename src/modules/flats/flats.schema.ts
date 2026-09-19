import {
  mysqlTable,
  int,
  varchar,
  decimal,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const FLAT_TYPES = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "STUDIO",
  "PENTHOUSE",
  "OTHER",
] as const;

export const flats = mysqlTable(
  "flats",
  {
    id: int("id").primaryKey().autoincrement(),
    societyId: int("society_id").notNull(),
    blockId: int("block_id").notNull(),
    floorId: int("floor_id").notNull(),
    flatNumber: varchar("flat_number", { length: 50 }).notNull().unique(),
    flatType: mysqlEnum("flat_type", FLAT_TYPES).default("2BHK").notNull(),
    areaSqft: decimal("area_sqft", { precision: 10, scale: 2 }).default("1200.00").notNull(),
    bedrooms: int("bedrooms").default(2).notNull(),
    bathrooms: int("bathrooms").default(2).notNull(),
    occupancyStatus: mysqlEnum("occupancy_status", [
      "VACANT",
      "OCCUPIED",
      "UNDER_MAINTENANCE",
    ]).default("VACANT").notNull(),
    ownershipStatus: mysqlEnum("ownership_status", [
      "OWNER_OCCUPIED",
      "TENANT_OCCUPIED",
      "VACANT",
    ]).default("VACANT").notNull(),
    monthlyMaintenance: decimal("monthly_maintenance", { precision: 10, scale: 2 })
      .notNull()
      .default("3000.00"),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    flatSocietyIdx: index("flat_society_idx").on(table.societyId),
    flatBlockIdx: index("flat_block_idx").on(table.blockId),
    flatFloorIdx: index("flat_floor_idx").on(table.floorId),
    flatOccupancyIdx: index("flat_occupancy_idx").on(table.occupancyStatus),
  })
);

export type Flat = typeof flats.$inferSelect;
export type NewFlat = typeof flats.$inferInsert;
