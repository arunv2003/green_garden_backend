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

export const announcements = mysqlTable(
  "announcements",
  {
    id: int("id").primaryKey().autoincrement(),
    societyId: int("society_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    attachmentUrl: text("attachment_url"),
    publishedBy: int("published_by").notNull(),
    publishDate: date("publish_date", { mode: "string" }).notNull(),
    expiryDate: date("expiry_date", { mode: "string" }),
    status: mysqlEnum("status", ["ACTIVE", "EXPIRED", "ARCHIVED"])
      .default("ACTIVE")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    announcementSocietyIdx: index("announcement_society_idx").on(table.societyId),
    announcementStatusIdx: index("announcement_status_idx").on(table.status),
  })
);

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
