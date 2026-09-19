import {
  mysqlTable,
  int,
  varchar,
  date,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

// 1. Society Residents Table
export const residents = mysqlTable(
  "residents",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull(),
    flatId: int("flat_id").notNull(),
    residentType: mysqlEnum("resident_type", ["OWNER", "TENANT", "FAMILY_MEMBER"])
      .default("TENANT")
      .notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    mobile: varchar("mobile", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }),
    gender: mysqlEnum("gender", ["MALE", "FEMALE", "OTHER"]).default("MALE").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    idProofType: varchar("id_proof_type", { length: 100 }).default("Aadhaar Card"),
    idProofNumber: varchar("id_proof_number", { length: 100 }),
    moveInDate: date("move_in_date", { mode: "string" }).notNull(),
    moveOutDate: date("move_out_date", { mode: "string" }),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    residentUserIdx: index("resident_user_idx").on(table.userId),
    residentFlatIdx: index("resident_flat_idx").on(table.flatId),
    residentStatusIdx: index("resident_status_idx").on(table.status),
  })
);

// 2. Family Members Table
export const familyMembers = mysqlTable(
  "family_members",
  {
    id: int("id").primaryKey().autoincrement(),
    residentId: int("resident_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    relationship: varchar("relationship", { length: 100 }).notNull(),
    age: int("age"),
    mobile: varchar("mobile", { length: 50 }),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    fmResidentIdx: index("fm_resident_idx").on(table.residentId),
  })
);

// 3. Vehicles Table
export const vehicles = mysqlTable(
  "vehicles",
  {
    id: int("id").primaryKey().autoincrement(),
    residentId: int("resident_id"),
    flatId: int("flat_id").notNull(),
    vehicleType: mysqlEnum("vehicle_type", ["CAR", "BIKE", "SCOOTER", "OTHER"])
      .default("CAR")
      .notNull(),
    vehicleNumber: varchar("vehicle_number", { length: 50 }).notNull(),
    brand: varchar("brand", { length: 100 }),
    model: varchar("model", { length: 100 }),
    parkingSlot: varchar("parking_slot", { length: 50 }),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    vehicleFlatIdx: index("vehicle_flat_idx").on(table.flatId),
    vehicleResidentIdx: index("vehicle_resident_idx").on(table.residentId),
    vehicleNumIdx: index("vehicle_num_idx").on(table.vehicleNumber),
  })
);

export type Resident = typeof residents.$inferSelect;
export type NewResident = typeof residents.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type NewFamilyMember = typeof familyMembers.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
