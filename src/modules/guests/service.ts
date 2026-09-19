import { eq, and, isNull, like, or, desc, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users, stays, rooms, monthlyBills, payments } from "../../db/schema/index.js";
import { hashPassword } from "../../utils/hash.js";

export class GuestService {
  static async getAllGuests(filters?: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    let conditions: any[] = [isNull(users.deletedAt)];

    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as any));
    } else {
      conditions.push(eq(users.role, "USER"));
    }

    if (filters?.status) {
      conditions.push(eq(users.status, filters.status as any));
    }

    const allGuests = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(users.name);

    // Enrich with active stays and financial summary
    const activeStays = await db
      .select({
        stayId: stays.id,
        userId: stays.userId,
        roomId: stays.roomId,
        roomNumber: rooms.roomNumber,
        floor: rooms.floor,
        checkInDate: stays.checkInDate,
        checkInTime: stays.checkInTime,
        monthlyRent: stays.monthlyRent,
      })
      .from(stays)
      .innerJoin(rooms, eq(stays.roomId, rooms.id))
      .where(eq(stays.status, "ACTIVE"));

    const stayMap = new Map<number, (typeof activeStays)[0]>();
    activeStays.forEach((s) => stayMap.set(s.userId, s));

    // Pending sums
    const pendingSums = await db
      .select({
        userId: monthlyBills.userId,
        totalPending: sql<string>`COALESCE(SUM(${monthlyBills.pendingAmount}), 0)`,
      })
      .from(monthlyBills)
      .groupBy(monthlyBills.userId);

    const pendingMap = new Map<number, number>();
    pendingSums.forEach((p) => pendingMap.set(p.userId, parseFloat(p.totalPending)));

    let enriched = allGuests.map((g) => {
      const { password: _, ...guestInfo } = g;
      const activeStay = stayMap.get(g.id);
      return {
        ...guestInfo,
        activeStay: activeStay || null,
        currentRoomNumber: activeStay?.roomNumber || null,
        totalPendingAmount: pendingMap.get(g.id) || 0,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      enriched = enriched.filter((g) => {
        return (
          g.name?.toLowerCase().includes(q) ||
          g.email?.toLowerCase().includes(q) ||
          g.mobile?.includes(q) ||
          (g.currentRoomNumber && g.currentRoomNumber.toLowerCase().includes(q))
        );
      });
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

  static async getGuestById(id: number) {
    const userRecords = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    if (userRecords.length === 0) {
      throw new Error("Guest not found");
    }

    const { password: _, ...guest } = userRecords[0];

    // Current stay
    const currentStayList = await db
      .select({
        id: stays.id,
        roomId: stays.roomId,
        roomNumber: rooms.roomNumber,
        roomType: rooms.roomType,
        floor: rooms.floor,
        checkInDate: stays.checkInDate,
        checkInTime: stays.checkInTime,
        monthlyRent: stays.monthlyRent,
        securityDeposit: stays.securityDeposit,
        status: stays.status,
        startingMeter: stays.startingMeter,
        remarks: stays.remarks,
      })
      .from(stays)
      .innerJoin(rooms, eq(stays.roomId, rooms.id))
      .where(and(eq(stays.userId, id), eq(stays.status, "ACTIVE")))
      .limit(1);

    const currentStay = currentStayList[0] || null;

    // Previous stays
    const previousStays = await db
      .select({
        id: stays.id,
        roomId: stays.roomId,
        roomNumber: rooms.roomNumber,
        roomType: rooms.roomType,
        floor: rooms.floor,
        checkInDate: stays.checkInDate,
        checkInTime: stays.checkInTime,
        checkOutDate: stays.checkOutDate,
        checkOutTime: stays.checkOutTime,
        checkOutReason: stays.checkOutReason,
        monthlyRent: stays.monthlyRent,
        securityDeposit: stays.securityDeposit,
        status: stays.status,
      })
      .from(stays)
      .innerJoin(rooms, eq(stays.roomId, rooms.id))
      .where(and(eq(stays.userId, id), eq(stays.status, "COMPLETED")))
      .orderBy(desc(stays.checkOutDate));

    // Monthly bills
    const bills = await db
      .select({
        id: monthlyBills.id,
        stayId: monthlyBills.stayId,
        billingMonth: monthlyBills.billingMonth,
        billingYear: monthlyBills.billingYear,
        billAmount: monthlyBills.billAmount,
        paidAmount: monthlyBills.paidAmount,
        pendingAmount: monthlyBills.pendingAmount,
        dueDate: monthlyBills.dueDate,
        status: monthlyBills.status,
        isProrated: monthlyBills.isProrated,
      })
      .from(monthlyBills)
      .where(eq(monthlyBills.userId, id))
      .orderBy(desc(monthlyBills.billingYear), desc(monthlyBills.billingMonth));

    // Payments
    const guestPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        transactionId: payments.transactionId,
        receiptNumber: payments.receiptNumber,
        billingMonth: payments.billingMonth,
        billingYear: payments.billingYear,
        status: payments.status,
        remarks: payments.remarks,
      })
      .from(payments)
      .where(eq(payments.userId, id))
      .orderBy(desc(payments.paymentDate));

    const totalBilled = bills.reduce((acc, b) => acc + parseFloat(b.billAmount), 0);
    const totalPaid = guestPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
    const totalPending = bills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);

    return {
      ...guest,
      currentStay,
      previousStays,
      bills,
      payments: guestPayments,
      financialSummary: {
        totalBilled,
        totalPaid,
        totalPending,
      },
    };
  }

  static async createGuest(data: any) {
    const cleanEmail = (data.email || "").trim();
    const cleanMobile = (data.mobile || "").trim();
    const cleanName = (data.name || "").trim();

    const existing = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, cleanEmail),
          eq(users.mobile, cleanMobile)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("A user with this email or mobile already exists");
    }

    const role = data.role && ["USER", "SECRETARY", "ACCOUNTANT"].includes(data.role)
      ? (data.role as "USER" | "SECRETARY" | "ACCOUNTANT")
      : "USER";

    let defaultPass = "User@123";
    if (role === "SECRETARY") defaultPass = "Secretary@123";
    else if (role === "ACCOUNTANT") defaultPass = "Accountant@123";

    const finalPass = data.password && data.password.trim().length >= 6
      ? data.password.trim()
      : defaultPass;

    const hashedPassword = await hashPassword(finalPass);

    const joiningDateStr = data.joiningDate
      ? (data.joiningDate.includes("T") ? data.joiningDate.split("T")[0] : data.joiningDate)
      : new Date().toISOString().slice(0, 10);

    const result = await db.insert(users).values({
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      password: hashedPassword,
      role: role,
      status: "ACTIVE",
      fatherHusbandName: data.fatherHusbandName ? data.fatherHusbandName.trim() : null,
      address: data.address ? data.address.trim() : null,
      idProofType: data.idProofType || (role === "ACCOUNTANT" ? "PAN Card" : "Aadhaar Card"),
      idProofNumber: data.idProofNumber ? data.idProofNumber.trim() : null,
      emergencyContact: data.emergencyContact ? data.emergencyContact.trim() : null,
      joiningDate: joiningDateStr as any,
      profilePhoto: data.profilePhoto || null,
      idProofDocument: data.idProofDocument || null,
    });

    return {
      id: result[0].insertId,
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      role: role,
      status: "ACTIVE",
    };
  }

  static async updateGuest(id: number, data: any) {
    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Guest not found");
    }

    const updatePayload: any = { ...data };
    if (data.password) {
      updatePayload.password = await hashPassword(data.password);
    }

    await db.update(users).set(updatePayload).where(eq(users.id, id));
    return this.getGuestById(id);
  }

  static async deleteGuest(id: number) {
    const activeStay = await db
      .select()
      .from(stays)
      .where(and(eq(stays.userId, id), eq(stays.status, "ACTIVE")));

    if (activeStay.length > 0) {
      throw new Error("Cannot delete guest who is currently checked into a room. Please check out first.");
    }

    await db.update(users).set({ deletedAt: new Date(), status: "INACTIVE" }).where(eq(users.id, id));
    return { success: true, message: "Guest deactivated successfully" };
  }
}
