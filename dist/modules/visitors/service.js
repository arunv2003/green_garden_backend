"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class VisitorService {
    static async getAllVisitors(filters) {
        let conditions = [];
        if (filters?.flatId)
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.visitors.flatId, filters.flatId));
        if (filters?.status && filters.status !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.visitors.status, filters.status));
        }
        if (filters?.date) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.visitors.entryDate, filters.date));
        }
        const list = await index_js_1.db
            .select({
            id: index_js_2.visitors.id,
            societyId: index_js_2.visitors.societyId,
            flatId: index_js_2.visitors.flatId,
            flatNumber: index_js_2.flats.flatNumber,
            blockName: index_js_2.blocks.name,
            invitedBy: index_js_2.visitors.invitedBy,
            hostName: index_js_2.users.name,
            visitorName: index_js_2.visitors.visitorName,
            mobile: index_js_2.visitors.mobile,
            purpose: index_js_2.visitors.purpose,
            vehicleNumber: index_js_2.visitors.vehicleNumber,
            entryDate: index_js_2.visitors.entryDate,
            entryTime: index_js_2.visitors.entryTime,
            exitDate: index_js_2.visitors.exitDate,
            exitTime: index_js_2.visitors.exitTime,
            status: index_js_2.visitors.status,
            approvedBy: index_js_2.visitors.approvedBy,
            createdAt: index_js_2.visitors.createdAt,
        })
            .from(index_js_2.visitors)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.visitors.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.visitors.invitedBy, index_js_2.users.id))
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.visitors.entryDate), (0, drizzle_orm_1.desc)(index_js_2.visitors.entryTime));
        let filtered = list;
        if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            filtered = filtered.filter((v) => v.visitorName.toLowerCase().includes(q) ||
                v.mobile.includes(q) ||
                v.flatNumber?.toLowerCase().includes(q) ||
                (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
                (v.purpose && v.purpose.toLowerCase().includes(q)));
        }
        const total = filtered.length;
        let items = filtered;
        const page = filters?.page ? Math.max(1, filters.page) : 1;
        const limit = filters?.limit ? Math.max(1, filters.limit) : total;
        if (filters?.page && filters?.limit) {
            const offset = (page - 1) * limit;
            items = filtered.slice(offset, offset + limit);
        }
        const currentlyInsideCount = list.filter((v) => v.status === "INSIDE").length;
        return {
            items,
            summary: {
                totalVisitors: total,
                currentlyInsideCount,
            },
            meta: {
                total,
                page,
                limit: filters?.limit || total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    static async getInsideVisitors() {
        return index_js_1.db
            .select({
            id: index_js_2.visitors.id,
            flatId: index_js_2.visitors.flatId,
            flatNumber: index_js_2.flats.flatNumber,
            blockName: index_js_2.blocks.name,
            visitorName: index_js_2.visitors.visitorName,
            mobile: index_js_2.visitors.mobile,
            purpose: index_js_2.visitors.purpose,
            vehicleNumber: index_js_2.visitors.vehicleNumber,
            entryDate: index_js_2.visitors.entryDate,
            entryTime: index_js_2.visitors.entryTime,
            status: index_js_2.visitors.status,
        })
            .from(index_js_2.visitors)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.visitors.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.visitors.status, "INSIDE"))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.visitors.entryDate), (0, drizzle_orm_1.desc)(index_js_2.visitors.entryTime));
    }
    static async logVisitorEntry(data, operatorId) {
        const res = await index_js_1.db.insert(index_js_2.visitors).values({
            societyId: data.societyId || 1,
            flatId: data.flatId,
            invitedBy: data.invitedBy || operatorId,
            visitorName: data.visitorName.trim(),
            mobile: data.mobile.trim(),
            purpose: data.purpose ? data.purpose.trim() : "Guest / Personal",
            vehicleNumber: data.vehicleNumber ? data.vehicleNumber.trim().toUpperCase() : null,
            entryDate: data.entryDate || new Date().toISOString().slice(0, 10),
            entryTime: data.entryTime || new Date().toTimeString().slice(0, 8),
            status: data.status || "INSIDE",
            approvedBy: operatorId,
        });
        const newId = res[0].insertId;
        if (operatorId) {
            await index_js_1.db.insert(index_js_2.auditLogs).values({
                userId: operatorId,
                action: "LOG_VISITOR_ENTRY",
                module: "VISITORS",
                recordId: newId,
                newData: JSON.stringify({ name: data.visitorName, flatId: data.flatId }),
            });
        }
        const created = await index_js_1.db.select().from(index_js_2.visitors).where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, newId)).limit(1);
        return created[0];
    }
    static async recordVisitorExit(id, exitData, operatorId) {
        const existing = await index_js_1.db.select().from(index_js_2.visitors).where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Visitor record not found");
        }
        const exitDate = exitData?.exitDate || new Date().toISOString().slice(0, 10);
        const exitTime = exitData?.exitTime || new Date().toTimeString().slice(0, 8);
        await index_js_1.db
            .update(index_js_2.visitors)
            .set({
            exitDate,
            exitTime,
            status: "EXITED",
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, id));
        const updated = await index_js_1.db.select().from(index_js_2.visitors).where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, id)).limit(1);
        return updated[0];
    }
    static async updateVisitor(id, data) {
        const existing = await index_js_1.db.select().from(index_js_2.visitors).where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Visitor record not found");
        }
        const payload = { updatedAt: new Date() };
        if (data.visitorName !== undefined)
            payload.visitorName = data.visitorName.trim();
        if (data.mobile !== undefined)
            payload.mobile = data.mobile.trim();
        if (data.purpose !== undefined)
            payload.purpose = data.purpose.trim();
        if (data.vehicleNumber !== undefined)
            payload.vehicleNumber = data.vehicleNumber ? data.vehicleNumber.trim().toUpperCase() : null;
        if (data.flatId !== undefined)
            payload.flatId = Number(data.flatId);
        if (data.status !== undefined)
            payload.status = data.status;
        if (data.entryDate !== undefined)
            payload.entryDate = data.entryDate;
        if (data.entryTime !== undefined)
            payload.entryTime = data.entryTime;
        if (data.exitDate !== undefined)
            payload.exitDate = data.exitDate;
        if (data.exitTime !== undefined)
            payload.exitTime = data.exitTime;
        await index_js_1.db.update(index_js_2.visitors).set(payload).where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, id));
        const updated = await index_js_1.db.select().from(index_js_2.visitors).where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, id)).limit(1);
        return updated[0];
    }
    static async deleteVisitor(id) {
        const existing = await index_js_1.db.select().from(index_js_2.visitors).where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Visitor record not found");
        }
        await index_js_1.db.delete(index_js_2.visitors).where((0, drizzle_orm_1.eq)(index_js_2.visitors.id, id));
        return { success: true, message: "Visitor log deleted successfully" };
    }
}
exports.VisitorService = VisitorService;
