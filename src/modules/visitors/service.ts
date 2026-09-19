import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { visitors, flats, blocks, users, auditLogs } from "../../db/schema/index.js";

export class VisitorService {
  static async getAllVisitors(filters?: {
    search?: string;
    flatId?: number;
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    let conditions: any[] = [];

    if (filters?.flatId) conditions.push(eq(visitors.flatId, filters.flatId));
    if (filters?.status && filters.status !== "ALL") {
      conditions.push(eq(visitors.status, filters.status as any));
    }
    if (filters?.date) {
      conditions.push(eq(visitors.entryDate, filters.date));
    }

    const list = await db
      .select({
        id: visitors.id,
        societyId: visitors.societyId,
        flatId: visitors.flatId,
        flatNumber: flats.flatNumber,
        blockName: blocks.name,
        invitedBy: visitors.invitedBy,
        hostName: users.name,
        visitorName: visitors.visitorName,
        mobile: visitors.mobile,
        purpose: visitors.purpose,
        vehicleNumber: visitors.vehicleNumber,
        entryDate: visitors.entryDate,
        entryTime: visitors.entryTime,
        exitDate: visitors.exitDate,
        exitTime: visitors.exitTime,
        status: visitors.status,
        approvedBy: visitors.approvedBy,
        createdAt: visitors.createdAt,
      })
      .from(visitors)
      .leftJoin(flats, eq(visitors.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(users, eq(visitors.invitedBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(visitors.entryDate), desc(visitors.entryTime));

    let filtered = list;
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.visitorName.toLowerCase().includes(q) ||
          v.mobile.includes(q) ||
          v.flatNumber?.toLowerCase().includes(q) ||
          (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
          (v.purpose && v.purpose.toLowerCase().includes(q))
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
    return db
      .select({
        id: visitors.id,
        flatId: visitors.flatId,
        flatNumber: flats.flatNumber,
        blockName: blocks.name,
        visitorName: visitors.visitorName,
        mobile: visitors.mobile,
        purpose: visitors.purpose,
        vehicleNumber: visitors.vehicleNumber,
        entryDate: visitors.entryDate,
        entryTime: visitors.entryTime,
        status: visitors.status,
      })
      .from(visitors)
      .leftJoin(flats, eq(visitors.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .where(eq(visitors.status, "INSIDE"))
      .orderBy(desc(visitors.entryDate), desc(visitors.entryTime));
  }

  static async logVisitorEntry(data: any, operatorId?: number) {
    const res = await db.insert(visitors).values({
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
      await db.insert(auditLogs).values({
        userId: operatorId,
        action: "LOG_VISITOR_ENTRY",
        module: "VISITORS",
        recordId: newId,
        newData: JSON.stringify({ name: data.visitorName, flatId: data.flatId }),
      });
    }

    const created = await db.select().from(visitors).where(eq(visitors.id, newId)).limit(1);
    return created[0];
  }

  static async recordVisitorExit(id: number, exitData?: any, operatorId?: number) {
    const existing = await db.select().from(visitors).where(eq(visitors.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Visitor record not found");
    }

    const exitDate = exitData?.exitDate || new Date().toISOString().slice(0, 10);
    const exitTime = exitData?.exitTime || new Date().toTimeString().slice(0, 8);

    await db
      .update(visitors)
      .set({
        exitDate,
        exitTime,
        status: "EXITED",
        updatedAt: new Date(),
      })
      .where(eq(visitors.id, id));

    const updated = await db.select().from(visitors).where(eq(visitors.id, id)).limit(1);
    return updated[0];
  }

  static async updateVisitor(id: number, data: any) {
    const existing = await db.select().from(visitors).where(eq(visitors.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Visitor record not found");
    }

    const payload: any = { updatedAt: new Date() };
    if (data.visitorName !== undefined) payload.visitorName = data.visitorName.trim();
    if (data.mobile !== undefined) payload.mobile = data.mobile.trim();
    if (data.purpose !== undefined) payload.purpose = data.purpose.trim();
    if (data.vehicleNumber !== undefined) payload.vehicleNumber = data.vehicleNumber ? data.vehicleNumber.trim().toUpperCase() : null;
    if (data.flatId !== undefined) payload.flatId = Number(data.flatId);
    if (data.status !== undefined) payload.status = data.status;
    if (data.entryDate !== undefined) payload.entryDate = data.entryDate;
    if (data.entryTime !== undefined) payload.entryTime = data.entryTime;
    if (data.exitDate !== undefined) payload.exitDate = data.exitDate;
    if (data.exitTime !== undefined) payload.exitTime = data.exitTime;

    await db.update(visitors).set(payload).where(eq(visitors.id, id));
    const updated = await db.select().from(visitors).where(eq(visitors.id, id)).limit(1);
    return updated[0];
  }

  static async deleteVisitor(id: number) {
    const existing = await db.select().from(visitors).where(eq(visitors.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Visitor record not found");
    }
    await db.delete(visitors).where(eq(visitors.id, id));
    return { success: true, message: "Visitor log deleted successfully" };
  }
}
