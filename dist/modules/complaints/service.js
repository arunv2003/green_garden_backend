"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class ComplaintService {
    static async getAllComplaints(filters) {
        let conditions = [];
        if (filters?.category && filters.category !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.complaints.category, filters.category));
        }
        if (filters?.priority && filters.priority !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.complaints.priority, filters.priority));
        }
        if (filters?.status && filters.status !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.complaints.status, filters.status));
        }
        if (filters?.flatId) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.complaints.flatId, filters.flatId));
        }
        if (filters?.createdBy) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.complaints.createdBy, filters.createdBy));
        }
        const list = await index_js_1.db
            .select({
            id: index_js_2.complaints.id,
            societyId: index_js_2.complaints.societyId,
            flatId: index_js_2.complaints.flatId,
            flatNumber: index_js_2.flats.flatNumber,
            blockName: index_js_2.blocks.name,
            createdBy: index_js_2.complaints.createdBy,
            creatorName: index_js_2.users.name,
            category: index_js_2.complaints.category,
            subject: index_js_2.complaints.subject,
            description: index_js_2.complaints.description,
            priority: index_js_2.complaints.priority,
            status: index_js_2.complaints.status,
            assignedTo: index_js_2.complaints.assignedTo,
            resolution: index_js_2.complaints.resolution,
            resolvedAt: index_js_2.complaints.resolvedAt,
            createdAt: index_js_2.complaints.createdAt,
            updatedAt: index_js_2.complaints.updatedAt,
        })
            .from(index_js_2.complaints)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.complaints.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.complaints.createdBy, index_js_2.users.id))
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.complaints.createdAt));
        let filtered = list;
        if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            filtered = filtered.filter((c) => c.subject.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                c.flatNumber?.toLowerCase().includes(q) ||
                c.creatorName?.toLowerCase().includes(q));
        }
        const total = filtered.length;
        let items = filtered;
        const page = filters?.page ? Math.max(1, filters.page) : 1;
        const limit = filters?.limit ? Math.max(1, filters.limit) : total;
        if (filters?.page && filters?.limit) {
            const offset = (page - 1) * limit;
            items = filtered.slice(offset, offset + limit);
        }
        const openCount = list.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS").length;
        const resolvedCount = list.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
        const formattedItems = items.map((c) => ({
            ...c,
            title: c.subject,
            complaintNumber: `CMP-${String(c.id).padStart(4, "0")}`,
            resolutionNotes: c.resolution,
        }));
        return {
            items: formattedItems,
            summary: {
                totalComplaints: total,
                openCount,
                resolvedCount,
            },
            meta: {
                total,
                page,
                limit: filters?.limit || total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    static async getComplaintById(id) {
        const list = await index_js_1.db
            .select({
            id: index_js_2.complaints.id,
            societyId: index_js_2.complaints.societyId,
            flatId: index_js_2.complaints.flatId,
            flatNumber: index_js_2.flats.flatNumber,
            blockName: index_js_2.blocks.name,
            createdBy: index_js_2.complaints.createdBy,
            creatorName: index_js_2.users.name,
            creatorMobile: index_js_2.users.mobile,
            creatorEmail: index_js_2.users.email,
            category: index_js_2.complaints.category,
            subject: index_js_2.complaints.subject,
            description: index_js_2.complaints.description,
            priority: index_js_2.complaints.priority,
            status: index_js_2.complaints.status,
            assignedTo: index_js_2.complaints.assignedTo,
            resolution: index_js_2.complaints.resolution,
            resolvedAt: index_js_2.complaints.resolvedAt,
            createdAt: index_js_2.complaints.createdAt,
            updatedAt: index_js_2.complaints.updatedAt,
        })
            .from(index_js_2.complaints)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.complaints.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.complaints.createdBy, index_js_2.users.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.complaints.id, id))
            .limit(1);
        if (list.length === 0) {
            throw new Error("Complaint ticket not found");
        }
        const c = list[0];
        return {
            ...c,
            title: c.subject,
            complaintNumber: `CMP-${String(c.id).padStart(4, "0")}`,
            resolutionNotes: c.resolution,
        };
    }
    static async createComplaint(data, creatorUserId) {
        const res = await index_js_1.db.insert(index_js_2.complaints).values({
            societyId: 1,
            flatId: data.flatId || null,
            createdBy: creatorUserId,
            category: data.category || "MAINTENANCE",
            subject: (data.subject || data.title || "").trim(),
            description: (data.description || "").trim(),
            priority: data.priority || "MEDIUM",
            status: "OPEN",
        });
        const newId = res[0].insertId;
        await index_js_1.db.insert(index_js_2.auditLogs).values({
            userId: creatorUserId,
            action: "CREATE_COMPLAINT",
            module: "COMPLAINTS",
            recordId: newId,
            newData: JSON.stringify({ subject: data.subject || data.title, category: data.category }),
        });
        return this.getComplaintById(newId);
    }
    static async updateComplaint(id, data, operatorId) {
        const existing = await index_js_1.db.select().from(index_js_2.complaints).where((0, drizzle_orm_1.eq)(index_js_2.complaints.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Complaint not found");
        }
        const payload = { updatedAt: new Date() };
        if (data.subject !== undefined)
            payload.subject = data.subject.trim();
        if (data.title !== undefined)
            payload.subject = data.title.trim();
        if (data.description !== undefined)
            payload.description = data.description.trim();
        if (data.category !== undefined)
            payload.category = data.category;
        if (data.priority !== undefined)
            payload.priority = data.priority;
        if (data.status !== undefined) {
            payload.status = data.status;
            if (data.status === "RESOLVED" || data.status === "CLOSED") {
                payload.resolvedAt = new Date();
            }
        }
        if (data.assignedTo !== undefined)
            payload.assignedTo = data.assignedTo;
        if (data.resolution !== undefined)
            payload.resolution = data.resolution;
        if (data.resolutionNotes !== undefined)
            payload.resolution = data.resolutionNotes;
        await index_js_1.db.update(index_js_2.complaints).set(payload).where((0, drizzle_orm_1.eq)(index_js_2.complaints.id, id));
        return this.getComplaintById(id);
    }
    static async deleteComplaint(id) {
        const existing = await index_js_1.db.select().from(index_js_2.complaints).where((0, drizzle_orm_1.eq)(index_js_2.complaints.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Complaint not found");
        }
        await index_js_1.db.delete(index_js_2.complaints).where((0, drizzle_orm_1.eq)(index_js_2.complaints.id, id));
        return { success: true, message: "Complaint ticket deleted successfully" };
    }
    static async updateComplaintStatus(id, data, operatorId) {
        const existing = await index_js_1.db.select().from(index_js_2.complaints).where((0, drizzle_orm_1.eq)(index_js_2.complaints.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Complaint not found");
        }
        const payload = {
            status: data.status,
            updatedAt: new Date(),
        };
        if (data.assignedTo !== undefined)
            payload.assignedTo = data.assignedTo;
        if (data.resolution !== undefined)
            payload.resolution = data.resolution;
        if (data.resolutionNotes !== undefined)
            payload.resolution = data.resolutionNotes;
        if (data.status === "RESOLVED" || data.status === "CLOSED") {
            payload.resolvedAt = new Date();
        }
        await index_js_1.db.update(index_js_2.complaints).set(payload).where((0, drizzle_orm_1.eq)(index_js_2.complaints.id, id));
        if (operatorId) {
            await index_js_1.db.insert(index_js_2.auditLogs).values({
                userId: operatorId,
                action: `UPDATE_COMPLAINT_STATUS_${data.status}`,
                module: "COMPLAINTS",
                recordId: id,
                newData: JSON.stringify(payload),
            });
        }
        return this.getComplaintById(id);
    }
}
exports.ComplaintService = ComplaintService;
