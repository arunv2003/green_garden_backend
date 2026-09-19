import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

// Users / Guests Table
export const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    mobile: varchar("mobile", { length: 50 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["USER", "SECRETARY", "ACCOUNTANT"]).default("USER").notNull(),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
    fatherHusbandName: varchar("father_husband_name", { length: 255 }),
    address: text("address"),
    idProofType: varchar("id_proof_type", { length: 100 }),
    idProofNumber: varchar("id_proof_number", { length: 100 }),
    emergencyContact: varchar("emergency_contact", { length: 50 }),
    joiningDate: date("joining_date", { mode: "string" }),
    profilePhoto: text("profile_photo"),
    idProofDocument: text("id_proof_document"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    mobileIdx: index("mobile_idx").on(table.mobile),
    roleIdx: index("role_idx").on(table.role),
    statusIdx: index("status_idx").on(table.status),
  })
);

// Documents Table
export const documents = mysqlTable(
  "documents",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull(),
    documentType: varchar("document_type", { length: 100 }).notNull(),
    documentUrl: text("document_url").notNull(),
    documentNumber: varchar("document_number", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("doc_user_id_idx").on(table.userId),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
