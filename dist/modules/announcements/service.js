"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class AnnouncementService {
    static async getAllAnnouncements(statusFilter) {
        let conditions = [];
        if (statusFilter && statusFilter !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.announcements.status, statusFilter));
        }
        else if (!statusFilter) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.announcements.status, "ACTIVE"));
        }
        const list = await index_js_1.db
            .select({
            id: index_js_2.announcements.id,
            societyId: index_js_2.announcements.societyId,
            title: index_js_2.announcements.title,
            description: index_js_2.announcements.description,
            attachmentUrl: index_js_2.announcements.attachmentUrl,
            publishedBy: index_js_2.announcements.publishedBy,
            authorName: index_js_2.users.name,
            publishDate: index_js_2.announcements.publishDate,
            expiryDate: index_js_2.announcements.expiryDate,
            status: index_js_2.announcements.status,
            createdAt: index_js_2.announcements.createdAt,
        })
            .from(index_js_2.announcements)
            .leftJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.announcements.publishedBy, index_js_2.users.id))
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.announcements.publishDate));
        return list.map((a) => ({
            ...a,
            content: a.description,
            expiresAt: a.expiryDate,
            category: "GENERAL",
        }));
    }
    static async createAnnouncement(data, authorUserId) {
        const title = (data.title || "").trim();
        const description = (data.description || data.content || "").trim();
        const expiryDate = data.expiryDate || data.expiresAt || null;
        const res = await index_js_1.db.insert(index_js_2.announcements).values({
            societyId: 1,
            title,
            description,
            attachmentUrl: data.attachmentUrl || null,
            publishedBy: authorUserId,
            publishDate: data.publishDate || new Date().toISOString().slice(0, 10),
            expiryDate,
            status: "ACTIVE",
        });
        const newId = res[0].insertId;
        await index_js_1.db.insert(index_js_2.auditLogs).values({
            userId: authorUserId,
            action: "PUBLISH_ANNOUNCEMENT",
            module: "ANNOUNCEMENTS",
            recordId: newId,
            newData: JSON.stringify({ title }),
        });
        const created = await index_js_1.db.select().from(index_js_2.announcements).where((0, drizzle_orm_1.eq)(index_js_2.announcements.id, newId)).limit(1);
        return {
            ...created[0],
            content: created[0].description,
            expiresAt: created[0].expiryDate,
        };
    }
    static async updateAnnouncement(id, data, operatorId) {
        const existing = await index_js_1.db.select().from(index_js_2.announcements).where((0, drizzle_orm_1.eq)(index_js_2.announcements.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Announcement not found");
        }
        const payload = { updatedAt: new Date() };
        if (data.title !== undefined)
            payload.title = data.title.trim();
        if (data.description !== undefined)
            payload.description = data.description.trim();
        if (data.content !== undefined)
            payload.description = data.content.trim();
        if (data.expiryDate !== undefined)
            payload.expiryDate = data.expiryDate;
        if (data.expiresAt !== undefined)
            payload.expiryDate = data.expiresAt;
        if (data.status !== undefined)
            payload.status = data.status;
        await index_js_1.db.update(index_js_2.announcements).set(payload).where((0, drizzle_orm_1.eq)(index_js_2.announcements.id, id));
        const updated = await index_js_1.db.select().from(index_js_2.announcements).where((0, drizzle_orm_1.eq)(index_js_2.announcements.id, id)).limit(1);
        return {
            ...updated[0],
            content: updated[0].description,
            expiresAt: updated[0].expiryDate,
        };
    }
    static async deleteAnnouncement(id, operatorId) {
        await index_js_1.db.delete(index_js_2.announcements).where((0, drizzle_orm_1.eq)(index_js_2.announcements.id, id));
        return { success: true, message: "Announcement deleted successfully" };
    }
}
exports.AnnouncementService = AnnouncementService;
