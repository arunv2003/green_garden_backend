"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expensesRelations = exports.announcementsRelations = exports.complaintsRelations = exports.visitorsRelations = exports.paymentAllocationsRelations = exports.paymentsRelations = exports.maintenanceBillsRelations = exports.vehiclesRelations = exports.familyMembersRelations = exports.residentsRelations = exports.usersRelations = exports.flatsRelations = exports.floorsRelations = exports.blocksRelations = exports.societiesRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
// Re-export all schemas from their respective module schema files
__exportStar(require("../../modules/guests/guests.schema.js"), exports);
__exportStar(require("../../modules/society/society.schema.js"), exports);
__exportStar(require("../../modules/flats/flats.schema.js"), exports);
__exportStar(require("../../modules/residents/residents.schema.js"), exports);
__exportStar(require("../../modules/maintenance/maintenance.schema.js"), exports);
__exportStar(require("../../modules/payments/payments.schema.js"), exports);
__exportStar(require("../../modules/visitors/visitors.schema.js"), exports);
__exportStar(require("../../modules/complaints/complaints.schema.js"), exports);
__exportStar(require("../../modules/announcements/announcements.schema.js"), exports);
__exportStar(require("../../modules/expenses/expenses.schema.js"), exports);
__exportStar(require("../../modules/audit/audit.schema.js"), exports);
__exportStar(require("../../modules/staff/staff.schema.js"), exports);
// Legacy exports for backwards compatibility during migration
__exportStar(require("../../modules/rooms/rooms.schema.js"), exports);
__exportStar(require("../../modules/stays/stays.schema.js"), exports);
__exportStar(require("../../modules/bills/bills.schema.js"), exports);
const guests_schema_js_1 = require("../../modules/guests/guests.schema.js");
const society_schema_js_1 = require("../../modules/society/society.schema.js");
const flats_schema_js_1 = require("../../modules/flats/flats.schema.js");
const residents_schema_js_1 = require("../../modules/residents/residents.schema.js");
const maintenance_schema_js_1 = require("../../modules/maintenance/maintenance.schema.js");
const payments_schema_js_1 = require("../../modules/payments/payments.schema.js");
const visitors_schema_js_1 = require("../../modules/visitors/visitors.schema.js");
const complaints_schema_js_1 = require("../../modules/complaints/complaints.schema.js");
const announcements_schema_js_1 = require("../../modules/announcements/announcements.schema.js");
const expenses_schema_js_1 = require("../../modules/expenses/expenses.schema.js");
// Database Relations
exports.societiesRelations = (0, drizzle_orm_1.relations)(society_schema_js_1.societies, ({ many }) => ({
    blocks: many(society_schema_js_1.blocks),
    flats: many(flats_schema_js_1.flats),
    maintenanceBills: many(maintenance_schema_js_1.maintenanceBills),
    visitors: many(visitors_schema_js_1.visitors),
    complaints: many(complaints_schema_js_1.complaints),
    announcements: many(announcements_schema_js_1.announcements),
    expenses: many(expenses_schema_js_1.expenses),
}));
exports.blocksRelations = (0, drizzle_orm_1.relations)(society_schema_js_1.blocks, ({ one, many }) => ({
    society: one(society_schema_js_1.societies, {
        fields: [society_schema_js_1.blocks.societyId],
        references: [society_schema_js_1.societies.id],
    }),
    floors: many(society_schema_js_1.floors),
    flats: many(flats_schema_js_1.flats),
}));
exports.floorsRelations = (0, drizzle_orm_1.relations)(society_schema_js_1.floors, ({ one, many }) => ({
    block: one(society_schema_js_1.blocks, {
        fields: [society_schema_js_1.floors.blockId],
        references: [society_schema_js_1.blocks.id],
    }),
    flats: many(flats_schema_js_1.flats),
}));
exports.flatsRelations = (0, drizzle_orm_1.relations)(flats_schema_js_1.flats, ({ one, many }) => ({
    society: one(society_schema_js_1.societies, {
        fields: [flats_schema_js_1.flats.societyId],
        references: [society_schema_js_1.societies.id],
    }),
    block: one(society_schema_js_1.blocks, {
        fields: [flats_schema_js_1.flats.blockId],
        references: [society_schema_js_1.blocks.id],
    }),
    floor: one(society_schema_js_1.floors, {
        fields: [flats_schema_js_1.flats.floorId],
        references: [society_schema_js_1.floors.id],
    }),
    residents: many(residents_schema_js_1.residents),
    vehicles: many(residents_schema_js_1.vehicles),
    maintenanceBills: many(maintenance_schema_js_1.maintenanceBills),
    payments: many(payments_schema_js_1.payments),
    visitors: many(visitors_schema_js_1.visitors),
    complaints: many(complaints_schema_js_1.complaints),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(guests_schema_js_1.users, ({ many }) => ({
    residents: many(residents_schema_js_1.residents),
    documents: many(guests_schema_js_1.documents),
    payments: many(payments_schema_js_1.payments),
    complaints: many(complaints_schema_js_1.complaints),
}));
exports.residentsRelations = (0, drizzle_orm_1.relations)(residents_schema_js_1.residents, ({ one, many }) => ({
    user: one(guests_schema_js_1.users, {
        fields: [residents_schema_js_1.residents.userId],
        references: [guests_schema_js_1.users.id],
    }),
    flat: one(flats_schema_js_1.flats, {
        fields: [residents_schema_js_1.residents.flatId],
        references: [flats_schema_js_1.flats.id],
    }),
    familyMembers: many(residents_schema_js_1.familyMembers),
    vehicles: many(residents_schema_js_1.vehicles),
    maintenanceBills: many(maintenance_schema_js_1.maintenanceBills),
}));
exports.familyMembersRelations = (0, drizzle_orm_1.relations)(residents_schema_js_1.familyMembers, ({ one }) => ({
    resident: one(residents_schema_js_1.residents, {
        fields: [residents_schema_js_1.familyMembers.residentId],
        references: [residents_schema_js_1.residents.id],
    }),
}));
exports.vehiclesRelations = (0, drizzle_orm_1.relations)(residents_schema_js_1.vehicles, ({ one }) => ({
    resident: one(residents_schema_js_1.residents, {
        fields: [residents_schema_js_1.vehicles.residentId],
        references: [residents_schema_js_1.residents.id],
    }),
    flat: one(flats_schema_js_1.flats, {
        fields: [residents_schema_js_1.vehicles.flatId],
        references: [flats_schema_js_1.flats.id],
    }),
}));
exports.maintenanceBillsRelations = (0, drizzle_orm_1.relations)(maintenance_schema_js_1.maintenanceBills, ({ one, many }) => ({
    flat: one(flats_schema_js_1.flats, {
        fields: [maintenance_schema_js_1.maintenanceBills.flatId],
        references: [flats_schema_js_1.flats.id],
    }),
    resident: one(residents_schema_js_1.residents, {
        fields: [maintenance_schema_js_1.maintenanceBills.residentId],
        references: [residents_schema_js_1.residents.id],
    }),
    society: one(society_schema_js_1.societies, {
        fields: [maintenance_schema_js_1.maintenanceBills.societyId],
        references: [society_schema_js_1.societies.id],
    }),
    payments: many(payments_schema_js_1.payments),
}));
exports.paymentsRelations = (0, drizzle_orm_1.relations)(payments_schema_js_1.payments, ({ one, many }) => ({
    flat: one(flats_schema_js_1.flats, {
        fields: [payments_schema_js_1.payments.flatId],
        references: [flats_schema_js_1.flats.id],
    }),
    resident: one(residents_schema_js_1.residents, {
        fields: [payments_schema_js_1.payments.residentId],
        references: [residents_schema_js_1.residents.id],
    }),
    maintenanceBill: one(maintenance_schema_js_1.maintenanceBills, {
        fields: [payments_schema_js_1.payments.maintenanceBillId],
        references: [maintenance_schema_js_1.maintenanceBills.id],
    }),
    allocations: many(payments_schema_js_1.paymentAllocations),
}));
exports.paymentAllocationsRelations = (0, drizzle_orm_1.relations)(payments_schema_js_1.paymentAllocations, ({ one }) => ({
    payment: one(payments_schema_js_1.payments, {
        fields: [payments_schema_js_1.paymentAllocations.paymentId],
        references: [payments_schema_js_1.payments.id],
    }),
    maintenanceBill: one(maintenance_schema_js_1.maintenanceBills, {
        fields: [payments_schema_js_1.paymentAllocations.maintenanceBillId],
        references: [maintenance_schema_js_1.maintenanceBills.id],
    }),
}));
exports.visitorsRelations = (0, drizzle_orm_1.relations)(visitors_schema_js_1.visitors, ({ one }) => ({
    flat: one(flats_schema_js_1.flats, {
        fields: [visitors_schema_js_1.visitors.flatId],
        references: [flats_schema_js_1.flats.id],
    }),
    society: one(society_schema_js_1.societies, {
        fields: [visitors_schema_js_1.visitors.societyId],
        references: [society_schema_js_1.societies.id],
    }),
    hostUser: one(guests_schema_js_1.users, {
        fields: [visitors_schema_js_1.visitors.invitedBy],
        references: [guests_schema_js_1.users.id],
    }),
}));
exports.complaintsRelations = (0, drizzle_orm_1.relations)(complaints_schema_js_1.complaints, ({ one }) => ({
    flat: one(flats_schema_js_1.flats, {
        fields: [complaints_schema_js_1.complaints.flatId],
        references: [flats_schema_js_1.flats.id],
    }),
    society: one(society_schema_js_1.societies, {
        fields: [complaints_schema_js_1.complaints.societyId],
        references: [society_schema_js_1.societies.id],
    }),
    creator: one(guests_schema_js_1.users, {
        fields: [complaints_schema_js_1.complaints.createdBy],
        references: [guests_schema_js_1.users.id],
    }),
}));
exports.announcementsRelations = (0, drizzle_orm_1.relations)(announcements_schema_js_1.announcements, ({ one }) => ({
    society: one(society_schema_js_1.societies, {
        fields: [announcements_schema_js_1.announcements.societyId],
        references: [society_schema_js_1.societies.id],
    }),
    author: one(guests_schema_js_1.users, {
        fields: [announcements_schema_js_1.announcements.publishedBy],
        references: [guests_schema_js_1.users.id],
    }),
}));
exports.expensesRelations = (0, drizzle_orm_1.relations)(expenses_schema_js_1.expenses, ({ one }) => ({
    society: one(society_schema_js_1.societies, {
        fields: [expenses_schema_js_1.expenses.societyId],
        references: [society_schema_js_1.societies.id],
    }),
    recordedBy: one(guests_schema_js_1.users, {
        fields: [expenses_schema_js_1.expenses.createdBy],
        references: [guests_schema_js_1.users.id],
    }),
}));
