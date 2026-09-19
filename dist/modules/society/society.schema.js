"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floors = exports.blocks = exports.societies = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// 1. Societies Master Table
exports.societies = (0, mysql_core_1.mysqlTable)("societies", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    registrationNumber: (0, mysql_core_1.varchar)("registration_number", { length: 100 }),
    address: (0, mysql_core_1.text)("address").notNull(),
    city: (0, mysql_core_1.varchar)("city", { length: 100 }).notNull(),
    state: (0, mysql_core_1.varchar)("state", { length: 100 }).notNull(),
    pincode: (0, mysql_core_1.varchar)("pincode", { length: 20 }).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }),
    phone: (0, mysql_core_1.varchar)("phone", { length: 50 }),
    maintenanceDueDay: (0, mysql_core_1.int)("maintenance_due_day").default(10).notNull(),
    lateFee: (0, mysql_core_1.decimal)("late_fee", { precision: 10, scale: 2 }).default("200.00").notNull(),
    logo: (0, mysql_core_1.text)("logo"),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
// 2. Blocks / Towers Table
exports.blocks = (0, mysql_core_1.mysqlTable)("blocks", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    societyId: (0, mysql_core_1.int)("society_id").notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    code: (0, mysql_core_1.varchar)("code", { length: 20 }).notNull(),
    numberOfFloors: (0, mysql_core_1.int)("number_of_floors").default(5).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    societyIdx: (0, mysql_core_1.index)("block_society_idx").on(table.societyId),
}));
// 3. Floors Table
exports.floors = (0, mysql_core_1.mysqlTable)("floors", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    blockId: (0, mysql_core_1.int)("block_id").notNull(),
    floorNumber: (0, mysql_core_1.int)("floor_number").notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    blockIdx: (0, mysql_core_1.index)("floor_block_idx").on(table.blockId),
}));
