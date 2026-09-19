"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complaints = exports.COMPLAINT_CATEGORIES = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.COMPLAINT_CATEGORIES = [
    "ELECTRICITY",
    "WATER",
    "CLEANING",
    "SECURITY",
    "PARKING",
    "MAINTENANCE",
    "LIFT",
    "OTHER",
];
exports.complaints = (0, mysql_core_1.mysqlTable)("complaints", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    societyId: (0, mysql_core_1.int)("society_id").notNull(),
    flatId: (0, mysql_core_1.int)("flat_id"),
    createdBy: (0, mysql_core_1.int)("created_by").notNull(),
    category: (0, mysql_core_1.mysqlEnum)("category", exports.COMPLAINT_CATEGORIES).default("MAINTENANCE").notNull(),
    subject: (0, mysql_core_1.varchar)("subject", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description").notNull(),
    priority: (0, mysql_core_1.mysqlEnum)("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"])
        .default("MEDIUM")
        .notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
        .default("OPEN")
        .notNull(),
    assignedTo: (0, mysql_core_1.int)("assigned_to"),
    resolution: (0, mysql_core_1.text)("resolution"),
    resolvedAt: (0, mysql_core_1.timestamp)("resolved_at"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    complaintFlatIdx: (0, mysql_core_1.index)("complaint_flat_idx").on(table.flatId),
    complaintCreatorIdx: (0, mysql_core_1.index)("complaint_creator_idx").on(table.createdBy),
    complaintStatusIdx: (0, mysql_core_1.index)("complaint_status_idx").on(table.status),
    complaintCategoryIdx: (0, mysql_core_1.index)("complaint_category_idx").on(table.category),
}));
