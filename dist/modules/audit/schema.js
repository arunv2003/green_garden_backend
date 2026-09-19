"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogs = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.auditLogs = (0, mysql_core_1.mysqlTable)("audit_logs", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id"),
    action: (0, mysql_core_1.varchar)("action", { length: 100 }).notNull(),
    module: (0, mysql_core_1.varchar)("module", { length: 100 }).notNull(),
    recordId: (0, mysql_core_1.int)("record_id").notNull(),
    oldData: (0, mysql_core_1.text)("old_data"),
    newData: (0, mysql_core_1.text)("new_data"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: (0, mysql_core_1.index)("audit_user_id_idx").on(table.userId),
    moduleIdx: (0, mysql_core_1.index)("audit_module_idx").on(table.module),
}));
