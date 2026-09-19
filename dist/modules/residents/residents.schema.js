"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicles = exports.familyMembers = exports.residents = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// 1. Society Residents Table
exports.residents = (0, mysql_core_1.mysqlTable)("residents", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    flatId: (0, mysql_core_1.int)("flat_id").notNull(),
    residentType: (0, mysql_core_1.mysqlEnum)("resident_type", ["OWNER", "TENANT", "FAMILY_MEMBER"])
        .default("TENANT")
        .notNull(),
    fullName: (0, mysql_core_1.varchar)("full_name", { length: 255 }).notNull(),
    mobile: (0, mysql_core_1.varchar)("mobile", { length: 50 }).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }),
    gender: (0, mysql_core_1.mysqlEnum)("gender", ["MALE", "FEMALE", "OTHER"]).default("MALE").notNull(),
    dateOfBirth: (0, mysql_core_1.date)("date_of_birth", { mode: "string" }),
    idProofType: (0, mysql_core_1.varchar)("id_proof_type", { length: 100 }).default("Aadhaar Card"),
    idProofNumber: (0, mysql_core_1.varchar)("id_proof_number", { length: 100 }),
    moveInDate: (0, mysql_core_1.date)("move_in_date", { mode: "string" }).notNull(),
    moveOutDate: (0, mysql_core_1.date)("move_out_date", { mode: "string" }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    residentUserIdx: (0, mysql_core_1.index)("resident_user_idx").on(table.userId),
    residentFlatIdx: (0, mysql_core_1.index)("resident_flat_idx").on(table.flatId),
    residentStatusIdx: (0, mysql_core_1.index)("resident_status_idx").on(table.status),
}));
// 2. Family Members Table
exports.familyMembers = (0, mysql_core_1.mysqlTable)("family_members", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    residentId: (0, mysql_core_1.int)("resident_id").notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    relationship: (0, mysql_core_1.varchar)("relationship", { length: 100 }).notNull(),
    age: (0, mysql_core_1.int)("age"),
    mobile: (0, mysql_core_1.varchar)("mobile", { length: 50 }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    fmResidentIdx: (0, mysql_core_1.index)("fm_resident_idx").on(table.residentId),
}));
// 3. Vehicles Table
exports.vehicles = (0, mysql_core_1.mysqlTable)("vehicles", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    residentId: (0, mysql_core_1.int)("resident_id"),
    flatId: (0, mysql_core_1.int)("flat_id").notNull(),
    vehicleType: (0, mysql_core_1.mysqlEnum)("vehicle_type", ["CAR", "BIKE", "SCOOTER", "OTHER"])
        .default("CAR")
        .notNull(),
    vehicleNumber: (0, mysql_core_1.varchar)("vehicle_number", { length: 50 }).notNull(),
    brand: (0, mysql_core_1.varchar)("brand", { length: 100 }),
    model: (0, mysql_core_1.varchar)("model", { length: 100 }),
    parkingSlot: (0, mysql_core_1.varchar)("parking_slot", { length: 50 }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    vehicleFlatIdx: (0, mysql_core_1.index)("vehicle_flat_idx").on(table.flatId),
    vehicleResidentIdx: (0, mysql_core_1.index)("vehicle_resident_idx").on(table.residentId),
    vehicleNumIdx: (0, mysql_core_1.index)("vehicle_num_idx").on(table.vehicleNumber),
}));
