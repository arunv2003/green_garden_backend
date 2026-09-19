import { relations } from "drizzle-orm";

// Re-export all schemas from their respective module schema files
export * from "../../modules/guests/guests.schema.js";
export * from "../../modules/society/society.schema.js";
export * from "../../modules/flats/flats.schema.js";
export * from "../../modules/residents/residents.schema.js";
export * from "../../modules/maintenance/maintenance.schema.js";
export * from "../../modules/payments/payments.schema.js";
export * from "../../modules/visitors/visitors.schema.js";
export * from "../../modules/complaints/complaints.schema.js";
export * from "../../modules/announcements/announcements.schema.js";
export * from "../../modules/expenses/expenses.schema.js";
export * from "../../modules/audit/audit.schema.js";
export * from "../../modules/staff/staff.schema.js";

// Legacy exports for backwards compatibility during migration
export * from "../../modules/rooms/rooms.schema.js";
export * from "../../modules/stays/stays.schema.js";
export * from "../../modules/bills/bills.schema.js";

import { users, documents } from "../../modules/guests/guests.schema.js";
import { societies, blocks, floors } from "../../modules/society/society.schema.js";
import { flats } from "../../modules/flats/flats.schema.js";
import { residents, familyMembers, vehicles } from "../../modules/residents/residents.schema.js";
import { maintenanceBills } from "../../modules/maintenance/maintenance.schema.js";
import { payments, paymentAllocations } from "../../modules/payments/payments.schema.js";
import { visitors } from "../../modules/visitors/visitors.schema.js";
import { complaints } from "../../modules/complaints/complaints.schema.js";
import { announcements } from "../../modules/announcements/announcements.schema.js";
import { expenses } from "../../modules/expenses/expenses.schema.js";

// Database Relations

export const societiesRelations = relations(societies, ({ many }) => ({
  blocks: many(blocks),
  flats: many(flats),
  maintenanceBills: many(maintenanceBills),
  visitors: many(visitors),
  complaints: many(complaints),
  announcements: many(announcements),
  expenses: many(expenses),
}));

export const blocksRelations = relations(blocks, ({ one, many }) => ({
  society: one(societies, {
    fields: [blocks.societyId],
    references: [societies.id],
  }),
  floors: many(floors),
  flats: many(flats),
}));

export const floorsRelations = relations(floors, ({ one, many }) => ({
  block: one(blocks, {
    fields: [floors.blockId],
    references: [blocks.id],
  }),
  flats: many(flats),
}));

export const flatsRelations = relations(flats, ({ one, many }) => ({
  society: one(societies, {
    fields: [flats.societyId],
    references: [societies.id],
  }),
  block: one(blocks, {
    fields: [flats.blockId],
    references: [blocks.id],
  }),
  floor: one(floors, {
    fields: [flats.floorId],
    references: [floors.id],
  }),
  residents: many(residents),
  vehicles: many(vehicles),
  maintenanceBills: many(maintenanceBills),
  payments: many(payments),
  visitors: many(visitors),
  complaints: many(complaints),
}));

export const usersRelations = relations(users, ({ many }) => ({
  residents: many(residents),
  documents: many(documents),
  payments: many(payments),
  complaints: many(complaints),
}));

export const residentsRelations = relations(residents, ({ one, many }) => ({
  user: one(users, {
    fields: [residents.userId],
    references: [users.id],
  }),
  flat: one(flats, {
    fields: [residents.flatId],
    references: [flats.id],
  }),
  familyMembers: many(familyMembers),
  vehicles: many(vehicles),
  maintenanceBills: many(maintenanceBills),
}));

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  resident: one(residents, {
    fields: [familyMembers.residentId],
    references: [residents.id],
  }),
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  resident: one(residents, {
    fields: [vehicles.residentId],
    references: [residents.id],
  }),
  flat: one(flats, {
    fields: [vehicles.flatId],
    references: [flats.id],
  }),
}));

export const maintenanceBillsRelations = relations(maintenanceBills, ({ one, many }) => ({
  flat: one(flats, {
    fields: [maintenanceBills.flatId],
    references: [flats.id],
  }),
  resident: one(residents, {
    fields: [maintenanceBills.residentId],
    references: [residents.id],
  }),
  society: one(societies, {
    fields: [maintenanceBills.societyId],
    references: [societies.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  flat: one(flats, {
    fields: [payments.flatId],
    references: [flats.id],
  }),
  resident: one(residents, {
    fields: [payments.residentId],
    references: [residents.id],
  }),
  maintenanceBill: one(maintenanceBills, {
    fields: [payments.maintenanceBillId],
    references: [maintenanceBills.id],
  }),
  allocations: many(paymentAllocations),
}));

export const paymentAllocationsRelations = relations(paymentAllocations, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentAllocations.paymentId],
    references: [payments.id],
  }),
  maintenanceBill: one(maintenanceBills, {
    fields: [paymentAllocations.maintenanceBillId],
    references: [maintenanceBills.id],
  }),
}));

export const visitorsRelations = relations(visitors, ({ one }) => ({
  flat: one(flats, {
    fields: [visitors.flatId],
    references: [flats.id],
  }),
  society: one(societies, {
    fields: [visitors.societyId],
    references: [societies.id],
  }),
  hostUser: one(users, {
    fields: [visitors.invitedBy],
    references: [users.id],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  flat: one(flats, {
    fields: [complaints.flatId],
    references: [flats.id],
  }),
  society: one(societies, {
    fields: [complaints.societyId],
    references: [societies.id],
  }),
  creator: one(users, {
    fields: [complaints.createdBy],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  society: one(societies, {
    fields: [announcements.societyId],
    references: [societies.id],
  }),
  author: one(users, {
    fields: [announcements.publishedBy],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  society: one(societies, {
    fields: [expenses.societyId],
    references: [societies.id],
  }),
  recordedBy: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
}));
