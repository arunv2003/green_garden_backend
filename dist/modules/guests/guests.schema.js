"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documents = exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// Users / Guests Table
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    mobile: (0, mysql_core_1.varchar)("mobile", { length: 50 }).notNull().unique(),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }).notNull(),
    role: (0, mysql_core_1.mysqlEnum)("role", ["USER", "SECRETARY", "ACCOUNTANT"]).default("USER").notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    fatherHusbandName: (0, mysql_core_1.varchar)("father_husband_name", { length: 255 }),
    address: (0, mysql_core_1.text)("address"),
    idProofType: (0, mysql_core_1.varchar)("id_proof_type", { length: 100 }),
    idProofNumber: (0, mysql_core_1.varchar)("id_proof_number", { length: 100 }),
    emergencyContact: (0, mysql_core_1.varchar)("emergency_contact", { length: 50 }),
    joiningDate: (0, mysql_core_1.date)("joining_date", { mode: "string" }),
    profilePhoto: (0, mysql_core_1.text)("profile_photo"),
    idProofDocument: (0, mysql_core_1.text)("id_proof_document"),
    deletedAt: (0, mysql_core_1.timestamp)("deleted_at"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    emailIdx: (0, mysql_core_1.index)("email_idx").on(table.email),
    mobileIdx: (0, mysql_core_1.index)("mobile_idx").on(table.mobile),
    roleIdx: (0, mysql_core_1.index)("role_idx").on(table.role),
    statusIdx: (0, mysql_core_1.index)("status_idx").on(table.status),
}));
// Documents Table
exports.documents = (0, mysql_core_1.mysqlTable)("documents", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    documentType: (0, mysql_core_1.varchar)("document_type", { length: 100 }).notNull(),
    documentUrl: (0, mysql_core_1.text)("document_url").notNull(),
    documentNumber: (0, mysql_core_1.varchar)("document_number", { length: 100 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: (0, mysql_core_1.index)("doc_user_id_idx").on(table.userId),
}));
