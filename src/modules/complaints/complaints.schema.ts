import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const COMPLAINT_CATEGORIES = [
  "ELECTRICITY",
  "WATER",
  "CLEANING",
  "SECURITY",
  "PARKING",
  "MAINTENANCE",
  "LIFT",
  "OTHER",
] as const;

export const complaints = mysqlTable(
  "complaints",
  {
    id: int("id").primaryKey().autoincrement(),
    societyId: int("society_id").notNull(),
    flatId: int("flat_id"),
    createdBy: int("created_by").notNull(),
    category: mysqlEnum("category", COMPLAINT_CATEGORIES).default("MAINTENANCE").notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    priority: mysqlEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"])
      .default("MEDIUM")
      .notNull(),
    status: mysqlEnum("status", ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
      .default("OPEN")
      .notNull(),
    assignedTo: int("assigned_to"),
    resolution: text("resolution"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    complaintFlatIdx: index("complaint_flat_idx").on(table.flatId),
    complaintCreatorIdx: index("complaint_creator_idx").on(table.createdBy),
    complaintStatusIdx: index("complaint_status_idx").on(table.status),
    complaintCategoryIdx: index("complaint_category_idx").on(table.category),
  })
);

export type Complaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;
