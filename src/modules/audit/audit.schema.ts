import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id"),
    action: varchar("action", { length: 100 }).notNull(),
    module: varchar("module", { length: 100 }).notNull(),
    recordId: int("record_id").notNull(),
    oldData: text("old_data"),
    newData: text("new_data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("audit_user_id_idx").on(table.userId),
    moduleIdx: index("audit_module_idx").on(table.module),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
