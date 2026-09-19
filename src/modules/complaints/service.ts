import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { complaints, flats, blocks, users, auditLogs } from "../../db/schema/index.js";

export class ComplaintService {
  static async getAllComplaints(filters?: {
    category?: string;
    priority?: string;
    status?: string;
    flatId?: number;
    createdBy?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let conditions: any[] = [];

    if (filters?.category && filters.category !== "ALL") {
      conditions.push(eq(complaints.category, filters.category as any));
    }
    if (filters?.priority && filters.priority !== "ALL") {
      conditions.push(eq(complaints.priority, filters.priority as any));
    }
    if (filters?.status && filters.status !== "ALL") {
      conditions.push(eq(complaints.status, filters.status as any));
    }
    if (filters?.flatId) {
      conditions.push(eq(complaints.flatId, filters.flatId));
    }
    if (filters?.createdBy) {
      conditions.push(eq(complaints.createdBy, filters.createdBy));
    }

    const list = await db
      .select({
        id: complaints.id,
        societyId: complaints.societyId,
        flatId: complaints.flatId,
        flatNumber: flats.flatNumber,
        blockName: blocks.name,
        createdBy: complaints.createdBy,
        creatorName: users.name,
        category: complaints.category,
        subject: complaints.subject,
        description: complaints.description,
        priority: complaints.priority,
        status: complaints.status,
        assignedTo: complaints.assignedTo,
        resolution: complaints.resolution,
        resolvedAt: complaints.resolvedAt,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
      })
      .from(complaints)
      .leftJoin(flats, eq(complaints.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(users, eq(complaints.createdBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(complaints.createdAt));

    let filtered = list;
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.subject.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.flatNumber?.toLowerCase().includes(q) ||
          c.creatorName?.toLowerCase().includes(q)
      );
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

  static async getComplaintById(id: number) {
    const list = await db
      .select({
        id: complaints.id,
        societyId: complaints.societyId,
        flatId: complaints.flatId,
        flatNumber: flats.flatNumber,
        blockName: blocks.name,
        createdBy: complaints.createdBy,
        creatorName: users.name,
        creatorMobile: users.mobile,
        creatorEmail: users.email,
        category: complaints.category,
        subject: complaints.subject,
        description: complaints.description,
        priority: complaints.priority,
        status: complaints.status,
        assignedTo: complaints.assignedTo,
        resolution: complaints.resolution,
        resolvedAt: complaints.resolvedAt,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
      })
      .from(complaints)
      .leftJoin(flats, eq(complaints.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(users, eq(complaints.createdBy, users.id))
      .where(eq(complaints.id, id))
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

  static async createComplaint(data: any, creatorUserId: number) {
    const res = await db.insert(complaints).values({
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

    await db.insert(auditLogs).values({
      userId: creatorUserId,
      action: "CREATE_COMPLAINT",
      module: "COMPLAINTS",
      recordId: newId,
      newData: JSON.stringify({ subject: data.subject || data.title, category: data.category }),
    });

    return this.getComplaintById(newId);
  }

  static async updateComplaint(id: number, data: any, operatorId?: number) {
    const existing = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Complaint not found");
    }

    const payload: any = { updatedAt: new Date() };
    if (data.subject !== undefined) payload.subject = data.subject.trim();
    if (data.title !== undefined) payload.subject = data.title.trim();
    if (data.description !== undefined) payload.description = data.description.trim();
    if (data.category !== undefined) payload.category = data.category;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.status !== undefined) {
      payload.status = data.status;
      if (data.status === "RESOLVED" || data.status === "CLOSED") {
        payload.resolvedAt = new Date();
      }
    }
    if (data.assignedTo !== undefined) payload.assignedTo = data.assignedTo;
    if (data.resolution !== undefined) payload.resolution = data.resolution;
    if (data.resolutionNotes !== undefined) payload.resolution = data.resolutionNotes;

    await db.update(complaints).set(payload).where(eq(complaints.id, id));
    return this.getComplaintById(id);
  }

  static async deleteComplaint(id: number) {
    const existing = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Complaint not found");
    }
    await db.delete(complaints).where(eq(complaints.id, id));
    return { success: true, message: "Complaint ticket deleted successfully" };
  }

  static async updateComplaintStatus(id: number, data: any, operatorId?: number) {
    const existing = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Complaint not found");
    }

    const payload: any = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.assignedTo !== undefined) payload.assignedTo = data.assignedTo;
    if (data.resolution !== undefined) payload.resolution = data.resolution;
    if (data.resolutionNotes !== undefined) payload.resolution = data.resolutionNotes;
    if (data.status === "RESOLVED" || data.status === "CLOSED") {
      payload.resolvedAt = new Date();
    }

    await db.update(complaints).set(payload).where(eq(complaints.id, id));

    if (operatorId) {
      await db.insert(auditLogs).values({
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
