import { eq, and, isNull, like, sql, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { rooms, stays, users, payments, monthlyBills } from "../../db/schema/index.js";

export class RoomService {
  static async getAllRooms(filters?: {
    search?: string;
    floor?: number;
    status?: string;
    roomType?: string;
    page?: number;
    limit?: number;
  }) {
    let conditions = [isNull(rooms.deletedAt)];

    if (filters?.floor !== undefined && !isNaN(filters.floor)) {
      conditions.push(eq(rooms.floor, filters.floor));
    }

    if (filters?.roomType && filters.roomType !== "ALL") {
      conditions.push(eq(rooms.roomType, filters.roomType as any));
    }

    const allRooms = await db
      .select()
      .from(rooms)
      .where(and(...conditions))
      .orderBy(rooms.roomNumber);

    // Enrich rooms with active occupant counts and details
    const activeStays = await db
      .select({
        stayId: stays.id,
        roomId: stays.roomId,
        userId: stays.userId,
        userName: users.name,
        userMobile: users.mobile,
        userEmail: users.email,
        checkInDate: stays.checkInDate,
        checkInTime: stays.checkInTime,
        monthlyRent: stays.monthlyRent,
      })
      .from(stays)
      .innerJoin(users, eq(stays.userId, users.id))
      .where(eq(stays.status, "ACTIVE"));

    const stayMap = new Map<number, typeof activeStays>();
    activeStays.forEach((s) => {
      const list = stayMap.get(s.roomId) || [];
      list.push(s);
      stayMap.set(s.roomId, list);
    });

    let enriched = allRooms.map((r) => {
      const occupants = stayMap.get(r.id) || [];
      let calculatedStatus = r.status;
      if (r.status !== "MAINTENANCE" && r.status !== "INACTIVE") {
        if (occupants.length === 0) {
          calculatedStatus = "AVAILABLE";
        } else if (occupants.length >= r.capacity) {
          calculatedStatus = "OCCUPIED";
        } else {
          calculatedStatus = "PARTIALLY_OCCUPIED";
        }
      }

      return {
        ...r,
        calculatedStatus,
        activeOccupantsCount: occupants.length,
        availableSlots: Math.max(0, r.capacity - occupants.length),
        currentResidents: occupants,
      };
    });

    if (filters?.status && filters.status !== "ALL") {
      enriched = enriched.filter(
        (r) => r.calculatedStatus === filters.status || r.status === filters.status
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      enriched = enriched.filter(
        (r) =>
          r.roomNumber.toLowerCase().includes(q) ||
          r.roomType.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.currentResidents.some(
            (res: any) =>
              res.userName?.toLowerCase().includes(q) ||
              res.userMobile?.includes(q)
          )
      );
    }

    const total = enriched.length;
    let items = enriched;
    const page = filters?.page ? Math.max(1, filters.page) : 1;
    const limit = filters?.limit ? Math.max(1, filters.limit) : total;

    if (filters?.page && filters?.limit) {
      const offset = (page - 1) * limit;
      items = enriched.slice(offset, offset + limit);
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

  static async getRoomById(id: number) {
    const roomRecords = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.id, id), isNull(rooms.deletedAt)))
      .limit(1);

    if (roomRecords.length === 0) {
      throw new Error("Room not found");
    }

    const room = roomRecords[0];

    // Current residents
    const currentResidents = await db
      .select({
        stayId: stays.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        mobile: users.mobile,
        checkInDate: stays.checkInDate,
        checkInTime: stays.checkInTime,
        monthlyRent: stays.monthlyRent,
        securityDeposit: stays.securityDeposit,
      })
      .from(stays)
      .innerJoin(users, eq(stays.userId, users.id))
      .where(and(eq(stays.roomId, id), eq(stays.status, "ACTIVE")));

    // Previous residents
    const previousResidents = await db
      .select({
        stayId: stays.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        mobile: users.mobile,
        checkInDate: stays.checkInDate,
        checkInTime: stays.checkInTime,
        checkOutDate: stays.checkOutDate,
        checkOutTime: stays.checkOutTime,
        checkOutReason: stays.checkOutReason,
        monthlyRent: stays.monthlyRent,
      })
      .from(stays)
      .innerJoin(users, eq(stays.userId, users.id))
      .where(and(eq(stays.roomId, id), eq(stays.status, "COMPLETED")))
      .orderBy(desc(stays.checkOutDate));

    // Payment summary for this room
    const roomPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        receiptNumber: payments.receiptNumber,
        billingMonth: payments.billingMonth,
        billingYear: payments.billingYear,
        userName: users.name,
      })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .where(eq(payments.roomId, id))
      .orderBy(desc(payments.paymentDate))
      .limit(20);

    const totalRevenueResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(and(eq(payments.roomId, id), eq(payments.status, "PAID")));

    const totalRevenue = parseFloat(totalRevenueResult[0]?.total || "0");

    return {
      ...room,
      activeOccupantsCount: currentResidents.length,
      availableSlots: Math.max(0, room.capacity - currentResidents.length),
      currentResidents,
      previousResidents,
      totalRevenue,
      recentPayments: roomPayments,
    };
  }

  static async createRoom(data: any) {
    const existing = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.roomNumber, data.roomNumber), isNull(rooms.deletedAt)))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Room number '${data.roomNumber}' already exists`);
    }

    const insertResult = await db.insert(rooms).values({
      roomNumber: data.roomNumber,
      floor: data.floor,
      roomType: data.roomType,
      capacity: data.capacity,
      monthlyRent: data.monthlyRent.toString(),
      securityDeposit: (data.securityDeposit || 0).toString(),
      description: data.description || null,
      status: data.status || "AVAILABLE",
    });

    return { id: insertResult[0].insertId, ...data };
  }

  static async updateRoom(id: number, data: any) {
    const existing = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.id, id), isNull(rooms.deletedAt)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Room not found");
    }

    if (data.roomNumber && data.roomNumber !== existing[0].roomNumber) {
      const duplicate = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.roomNumber, data.roomNumber), isNull(rooms.deletedAt)))
        .limit(1);
      if (duplicate.length > 0) {
        throw new Error(`Room number '${data.roomNumber}' already exists`);
      }
    }

    const updatePayload: any = { ...data };
    if (data.monthlyRent !== undefined) {
      updatePayload.monthlyRent = data.monthlyRent.toString();
    }
    if (data.securityDeposit !== undefined) {
      updatePayload.securityDeposit = data.securityDeposit.toString();
    }

    await db.update(rooms).set(updatePayload).where(eq(rooms.id, id));
    return this.getRoomById(id);
  }

  static async deleteRoom(id: number) {
    // Check if active stays exist
    const activeStays = await db
      .select()
      .from(stays)
      .where(and(eq(stays.roomId, id), eq(stays.status, "ACTIVE")));

    if (activeStays.length > 0) {
      throw new Error("Cannot delete room with active residents. Check out residents first.");
    }

    await db
      .update(rooms)
      .set({ deletedAt: new Date(), status: "INACTIVE" })
      .where(eq(rooms.id, id));

    return { success: true, message: "Room soft-deleted successfully" };
  }

  static async updateRoomStatus(roomId: number) {
    const roomData = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (roomData.length === 0) return;
    const room = roomData[0];

    if (room.status === "MAINTENANCE" || room.status === "INACTIVE") return;

    const activeResidents = await db
      .select()
      .from(stays)
      .where(and(eq(stays.roomId, roomId), eq(stays.status, "ACTIVE")));

    let newStatus = "AVAILABLE";
    if (activeResidents.length >= room.capacity) {
      newStatus = "OCCUPIED";
    } else if (activeResidents.length > 0) {
      newStatus = "PARTIALLY_OCCUPIED";
    }

    await db.update(rooms).set({ status: newStatus as any }).where(eq(rooms.id, roomId));
  }
}
