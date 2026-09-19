"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcements = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.announcements = (0, mysql_core_1.mysqlTable)("announcements", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    societyId: (0, mysql_core_1.int)("society_id").notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description").notNull(),
    attachmentUrl: (0, mysql_core_1.text)("attachment_url"),
    publishedBy: (0, mysql_core_1.int)("published_by").notNull(),
    publishDate: (0, mysql_core_1.date)("publish_date", { mode: "string" }).notNull(),
    expiryDate: (0, mysql_core_1.date)("expiry_date", { mode: "string" }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["ACTIVE", "EXPIRED", "ARCHIVED"])
        .default("ACTIVE")
        .notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    announcementSocietyIdx: (0, mysql_core_1.index)("announcement_society_idx").on(table.societyId),
    announcementStatusIdx: (0, mysql_core_1.index)("announcement_status_idx").on(table.status),
}));
