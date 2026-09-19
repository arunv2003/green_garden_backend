import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { stays, rooms, users, monthlyBills, auditLogs } from "../../db/schema/index.js";
import { RoomService } from "../rooms/service.js";
import { config } from "../../config/index.js";

export class StayService {
  static async getAllStays(filters?: {
    status?: string;
    userId?: number;
    roomId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let query = db
      .select({
        id: stays.id,
        userId: stays.userId,
        userName: users.name,
        userMobile: users.mobile,
        userEmail: users.email,
        roomId: stays.roomId,
        roomNumber: rooms.roomNumber,
        floor: rooms.floor,
        roomType: rooms.roomType,
        checkInDate: stays.checkInDate,
        checkInTime: stays.checkInTime,
        checkOutDate: stays.checkOutDate,
        checkOutTime: stays.checkOutTime,
        monthlyRent: stays.monthlyRent,
        securityDeposit: stays.securityDeposit,
        initialPending: stays.initialPending,
        finalPending: stays.finalPending,
        status: stays.status,
        checkOutReason: stays.checkOutReason,
        remarks: stays.remarks,
        createdAt: stays.createdAt,
      })
      .from(stays)
      .innerJoin(users, eq(stays.userId, users.id))
      .innerJoin(rooms, eq(stays.roomId, rooms.id))
      .orderBy(desc(stays.createdAt));

    const allStays = await query;
    const filtered = allStays.filter((s) => {
      if (filters?.status && filters.status !== "ALL" && s.status !== filters.status) return false;
      if (filters?.userId && s.userId !== filters.userId) return false;
      if (filters?.roomId && s.roomId !== filters.roomId) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        const matches =
          s.userName?.toLowerCase().includes(q) ||
          s.roomNumber?.toLowerCase().includes(q) ||
          s.userMobile?.includes(q) ||
          (s.userEmail && s.userEmail.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });

    const total = filtered.length;
    let items = filtered;
    const page = filters?.page ? Math.max(1, filters.page) : 1;
    const limit = filters?.limit ? Math.max(1, filters.limit) : total;

    if (filters?.page && filters?.limit) {
      const offset = (page - 1) * limit;
      items = filtered.slice(offset, offset + limit);
    }

    return {
      items,
      meta: {
        total,
        page,
        limit: filters?.limit || total,
        totalPages: filters?.limit ? Math.ceil(total / limit) || 1 : 1,
      },
    };
  }

  static async getStayById(id: number) {
    const records = await db
      .select({
        id: stays.id,
        userId: stays.userId,
        userName: users.name,
        userMobile: users.mobile,
        userEmail: users.email,
        roomId: stays.roomId,
        roomNumber: rooms.roomNumber,
        floor: rooms.floor,
        roomType: rooms.roomType,
        checkInDate: stays.checkInDate,
        checkInTime: stays.checkInTime,
        checkOutDate: stays.checkOutDate,
        checkOutTime: stays.checkOutTime,
        monthlyRent: stays.monthlyRent,
        securityDeposit: stays.securityDeposit,
        initialPending: stays.initialPending,
        finalPending: stays.finalPending,
        status: stays.status,
        checkOutReason: stays.checkOutReason,
        remarks: stays.remarks,
        startingMeter: stays.startingMeter,
        createdAt: stays.createdAt,
      })
      .from(stays)
      .innerJoin(users, eq(stays.userId, users.id))
      .innerJoin(rooms, eq(stays.roomId, rooms.id))
      .where(eq(stays.id, id))
      .limit(1);

    if (records.length === 0) {
      throw new Error("Stay record not found");
    }

    return records[0];
  }

  static async checkIn(data: any, createdByUserId?: number) {
    // 1. Check if user already has an active stay
    const existingActiveStay = await db
      .select()
      .from(stays)
      .where(and(eq(stays.userId, data.userId), eq(stays.status, "ACTIVE")))
      .limit(1);

    if (existingActiveStay.length > 0) {
      throw new Error(
        "User already has an active stay in another room. Check out from the previous room first."
      );
    }

    // 2. Check room capacity
    const roomRecords = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, data.roomId))
      .limit(1);

    if (roomRecords.length === 0) {
      throw new Error("Room not found");
    }

    const room = roomRecords[0];
    if (room.status === "MAINTENANCE" || room.status === "INACTIVE") {
      throw new Error(`Room is currently under ${room.status.toLowerCase()} and cannot be assigned`);
    }

    const currentOccupants = await db
      .select()
      .from(stays)
      .where(and(eq(stays.roomId, data.roomId), eq(stays.status, "ACTIVE")));

    if (currentOccupants.length >= room.capacity) {
      throw new Error(`Room ${room.roomNumber} has reached maximum capacity (${room.capacity} occupants)`);
    }

    // 3. Compute initial bill and prorated amount
    const checkInDateObj = new Date(data.checkInDate);
    const billingMonth = checkInDateObj.getMonth() + 1; // 1-12
    const billingYear = checkInDateObj.getFullYear();
    const daysInMonth = new Date(billingYear, billingMonth, 0).getDate();
    const dayOfMonth = checkInDateObj.getDate();

    let initialBillAmount = data.monthlyRent;
    let isProrated = false;
    let proratedDays = daysInMonth;

    if (config.billingMode === "DAILY_PRORATED" && dayOfMonth > 1) {
      proratedDays = daysInMonth - dayOfMonth + 1;
      initialBillAmount = Math.round((data.monthlyRent / daysInMonth) * proratedDays);
      isProrated = true;
    }

    // 4. Create Stay record
    const insertStay = await db.insert(stays).values({
      userId: data.userId,
      roomId: data.roomId,
      checkInDate: data.checkInDate,
      checkInTime: data.checkInTime || "10:00:00",
      monthlyRent: data.monthlyRent.toString(),
      securityDeposit: (data.securityDeposit || 0).toString(),
      initialPending: initialBillAmount.toString(),
      status: "ACTIVE",
      remarks: data.remarks || null,
      startingMeter: data.startingMeter || null,
      createdBy: createdByUserId || null,
    });

    const stayId = insertStay[0].insertId;

    // 5. Generate initial monthly bill
    const dueDate = new Date(billingYear, billingMonth - 1, Math.min(10, daysInMonth))
      .toISOString()
      .split("T")[0];

    await db.insert(monthlyBills).values({
      stayId,
      userId: data.userId,
      roomId: data.roomId,
      billingMonth,
      billingYear,
      billAmount: initialBillAmount.toString(),
      paidAmount: "0.00",
      pendingAmount: initialBillAmount.toString(),
      dueDate,
      status: "PENDING",
      isProrated,
      proratedDays: isProrated ? proratedDays : null,
      remarks: isProrated
        ? `Prorated initial bill for ${proratedDays} days (checked in on ${data.checkInDate})`
        : "Initial monthly rent bill",
    });

    // 6. Update room status
    await RoomService.updateRoomStatus(data.roomId);

    // 7. Audit log
    await db.insert(auditLogs).values({
      userId: createdByUserId || null,
      action: "CHECK_IN",
      module: "STAYS",
      recordId: stayId,
      newData: JSON.stringify({
        stayId,
        userId: data.userId,
        roomId: data.roomId,
        checkInDate: data.checkInDate,
        initialBillAmount,
      }),
    });

    return this.getStayById(stayId);
  }

  static async checkOut(stayId: number, data: any, checkedOutByUserId?: number) {
    const stayRecords = await db
      .select()
      .from(stays)
      .where(eq(stays.id, stayId))
      .limit(1);

    if (stayRecords.length === 0) {
      throw new Error("Stay record not found");
    }

    const stay = stayRecords[0];
    if (stay.status !== "ACTIVE") {
      throw new Error("Stay is not active");
    }

    // Calculate final pending balance
    const userBills = await db
      .select()
      .from(monthlyBills)
      .where(and(eq(monthlyBills.stayId, stayId), eq(monthlyBills.userId, stay.userId)));

    const totalPending = userBills.reduce(
      (acc, b) => acc + parseFloat(b.pendingAmount),
      0
    );

    // Update Stay to COMPLETED
    await db
      .update(stays)
      .set({
        status: "COMPLETED",
        checkOutDate: data.checkOutDate,
        checkOutTime: data.checkOutTime || "12:00:00",
        checkOutReason: data.checkOutReason || "Normal Checkout",
        finalPending: totalPending.toString(),
        securityDepositAdjustment: (data.securityDepositAdjustment || 0).toString(),
        remarks: data.remarks || stay.remarks,
        checkedOutBy: checkedOutByUserId || null,
      })
      .where(eq(stays.id, stayId));

    // Update Room status
    await RoomService.updateRoomStatus(stay.roomId);

    // Audit log
    await db.insert(auditLogs).values({
      userId: checkedOutByUserId || null,
      action: "CHECK_OUT",
      module: "STAYS",
      recordId: stayId,
      newData: JSON.stringify({
        stayId,
        checkOutDate: data.checkOutDate,
        finalPending: totalPending,
      }),
    });

    return this.getStayById(stayId);
  }

  static async updateStay(stayId: number, data: any) {
    const existing = await db.select().from(stays).where(eq(stays.id, stayId)).limit(1);
    if (existing.length === 0) throw new Error("Stay record not found");

    const payload: any = {};
    if (data.monthlyRent !== undefined) payload.monthlyRent = data.monthlyRent.toString();
    if (data.checkInDate !== undefined) payload.checkInDate = data.checkInDate;
    if (data.checkOutDate !== undefined) payload.checkOutDate = data.checkOutDate;
    if (data.status !== undefined) payload.status = data.status;
    if (data.remarks !== undefined) payload.remarks = data.remarks;

    await db.update(stays).set(payload).where(eq(stays.id, stayId));
    if (existing[0].roomId) {
      await RoomService.updateRoomStatus(existing[0].roomId);
    }
    return this.getStayById(stayId);
  }

  static async deleteStay(stayId: number) {
    const existing = await db.select().from(stays).where(eq(stays.id, stayId)).limit(1);
    if (existing.length === 0) throw new Error("Stay record not found");
    const roomId = existing[0].roomId;
    await db.delete(stays).where(eq(stays.id, stayId));
    if (roomId) {
      await RoomService.updateRoomStatus(roomId);
    }
    return { success: true, message: "Stay record deleted successfully" };
  }
}
