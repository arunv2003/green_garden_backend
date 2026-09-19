import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { announcements, users, auditLogs } from "../../db/schema/index.js";

export class AnnouncementService {
  static async getAllAnnouncements(statusFilter?: string) {
    let conditions: any[] = [];
    if (statusFilter && statusFilter !== "ALL") {
      conditions.push(eq(announcements.status, statusFilter as any));
    } else if (!statusFilter) {
      conditions.push(eq(announcements.status, "ACTIVE"));
    }

    const list = await db
      .select({
        id: announcements.id,
        societyId: announcements.societyId,
        title: announcements.title,
        description: announcements.description,
        attachmentUrl: announcements.attachmentUrl,
        publishedBy: announcements.publishedBy,
        authorName: users.name,
        publishDate: announcements.publishDate,
        expiryDate: announcements.expiryDate,
        status: announcements.status,
        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.publishedBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(announcements.publishDate));

    return list.map((a) => ({
      ...a,
      content: a.description,
      expiresAt: a.expiryDate,
      category: "GENERAL",
    }));
  }

  static async createAnnouncement(data: any, authorUserId: number) {
    const title = (data.title || "").trim();
    const description = (data.description || data.content || "").trim();
    const expiryDate = data.expiryDate || data.expiresAt || null;

    const res = await db.insert(announcements).values({
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

    await db.insert(auditLogs).values({
      userId: authorUserId,
      action: "PUBLISH_ANNOUNCEMENT",
      module: "ANNOUNCEMENTS",
      recordId: newId,
      newData: JSON.stringify({ title }),
    });

    const created = await db.select().from(announcements).where(eq(announcements.id, newId)).limit(1);
    return {
      ...created[0],
      content: created[0].description,
      expiresAt: created[0].expiryDate,
    };
  }

  static async updateAnnouncement(id: number, data: any, operatorId?: number) {
    const existing = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Announcement not found");
    }

    const payload: any = { updatedAt: new Date() };
    if (data.title !== undefined) payload.title = data.title.trim();
    if (data.description !== undefined) payload.description = data.description.trim();
    if (data.content !== undefined) payload.description = data.content.trim();
    if (data.expiryDate !== undefined) payload.expiryDate = data.expiryDate;
    if (data.expiresAt !== undefined) payload.expiryDate = data.expiresAt;
    if (data.status !== undefined) payload.status = data.status;

    await db.update(announcements).set(payload).where(eq(announcements.id, id));
    const updated = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    return {
      ...updated[0],
      content: updated[0].description,
      expiresAt: updated[0].expiryDate,
    };
  }

  static async deleteAnnouncement(id: number, operatorId?: number) {
    await db.delete(announcements).where(eq(announcements.id, id));
    return { success: true, message: "Announcement deleted successfully" };
  }
}
