import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { monthlyBills, stays, users, rooms } from "../../db/schema/index.js";
import { config } from "../../config/index.js";

export class BillService {
  static async getAllBills(filters?: {
    month?: number;
    year?: number;
    status?: string;
    userId?: number;
    roomId?: number;
  }) {
    let query = db
      .select({
        id: monthlyBills.id,
        stayId: monthlyBills.stayId,
        userId: monthlyBills.userId,
        userName: users.name,
        userMobile: users.mobile,
        roomId: monthlyBills.roomId,
        roomNumber: rooms.roomNumber,
        floor: rooms.floor,
        billingMonth: monthlyBills.billingMonth,
        billingYear: monthlyBills.billingYear,
        billAmount: monthlyBills.billAmount,
        paidAmount: monthlyBills.paidAmount,
        pendingAmount: monthlyBills.pendingAmount,
        dueDate: monthlyBills.dueDate,
        status: monthlyBills.status,
        isProrated: monthlyBills.isProrated,
        proratedDays: monthlyBills.proratedDays,
        remarks: monthlyBills.remarks,
        createdAt: monthlyBills.createdAt,
      })
      .from(monthlyBills)
      .innerJoin(users, eq(monthlyBills.userId, users.id))
      .innerJoin(rooms, eq(monthlyBills.roomId, rooms.id))
      .orderBy(desc(monthlyBills.billingYear), desc(monthlyBills.billingMonth), rooms.roomNumber);

    const bills = await query;
    return bills.filter((b) => {
      if (filters?.month && b.billingMonth !== filters.month) return false;
      if (filters?.year && b.billingYear !== filters.year) return false;
      if (filters?.status && b.status !== filters.status) return false;
      if (filters?.userId && b.userId !== filters.userId) return false;
      if (filters?.roomId && b.roomId !== filters.roomId) return false;
      return true;
    });
  }

  static async getBillById(id: number) {
    const records = await db
      .select({
        id: monthlyBills.id,
        stayId: monthlyBills.stayId,
        userId: monthlyBills.userId,
        userName: users.name,
        userMobile: users.mobile,
        roomId: monthlyBills.roomId,
        roomNumber: rooms.roomNumber,
        billingMonth: monthlyBills.billingMonth,
        billingYear: monthlyBills.billingYear,
        billAmount: monthlyBills.billAmount,
        paidAmount: monthlyBills.paidAmount,
        pendingAmount: monthlyBills.pendingAmount,
        dueDate: monthlyBills.dueDate,
        status: monthlyBills.status,
        isProrated: monthlyBills.isProrated,
        proratedDays: monthlyBills.proratedDays,
        remarks: monthlyBills.remarks,
        createdAt: monthlyBills.createdAt,
      })
      .from(monthlyBills)
      .innerJoin(users, eq(monthlyBills.userId, users.id))
      .innerJoin(rooms, eq(monthlyBills.roomId, rooms.id))
      .where(eq(monthlyBills.id, id))
      .limit(1);

    if (records.length === 0) {
      throw new Error("Bill not found");
    }

    return records[0];
  }

  static async generateMonthlyBills(month: number, year: number, inputDueDate?: string) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthStartStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const monthEndStr = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    const defaultDueDate =
      inputDueDate ||
      `${year}-${String(month).padStart(2, "0")}-${String(Math.min(10, daysInMonth)).padStart(2, "0")}`;

    // Active stays during this billing month
    const activeStays = await db
      .select()
      .from(stays)
      .where(
        and(
          sql`${stays.checkInDate} <= ${monthEndStr}`,
          sql`(${stays.checkOutDate} IS NULL OR ${stays.checkOutDate} >= ${monthStartStr})`
        )
      );

    let generatedCount = 0;
    const generatedBills: any[] = [];

    for (const stay of activeStays) {
      // Check if bill already exists
      const existing = await db
        .select()
        .from(monthlyBills)
        .where(
          and(
            eq(monthlyBills.stayId, stay.id),
            eq(monthlyBills.billingMonth, month),
            eq(monthlyBills.billingYear, year)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        continue;
      }

      const rent = parseFloat(stay.monthlyRent);
      const checkInDate = new Date(stay.checkInDate);
      const checkInMonth = checkInDate.getMonth() + 1;
      const checkInYear = checkInDate.getFullYear();
      const checkInDay = checkInDate.getDate();

      let billAmount = rent;
      let isProrated = false;
      let proratedDays = daysInMonth;

      // Check if checked in mid-month
      if (checkInYear === year && checkInMonth === month && checkInDay > 1) {
        if (config.billingMode === "DAILY_PRORATED") {
          proratedDays = daysInMonth - checkInDay + 1;
          billAmount = Math.round((rent / daysInMonth) * proratedDays);
          isProrated = true;
        }
      }

      // Check if checkout happened during this month
      if (stay.checkOutDate) {
        const checkOutDate = new Date(stay.checkOutDate);
        const checkOutMonth = checkOutDate.getMonth() + 1;
        const checkOutYear = checkOutDate.getFullYear();
        const checkOutDay = checkOutDate.getDate();

        if (checkOutYear === year && checkOutMonth === month && checkOutDay < daysInMonth) {
          if (config.billingMode === "DAILY_PRORATED") {
            const startDay = (checkInYear === year && checkInMonth === month) ? checkInDay : 1;
            proratedDays = checkOutDay - startDay + 1;
            billAmount = Math.round((rent / daysInMonth) * proratedDays);
            isProrated = true;
          }
        }
      }

      const insertResult = await db.insert(monthlyBills).values({
        stayId: stay.id,
        userId: stay.userId,
        roomId: stay.roomId,
        billingMonth: month,
        billingYear: year,
        billAmount: billAmount.toString(),
        paidAmount: "0.00",
        pendingAmount: billAmount.toString(),
        dueDate: defaultDueDate,
        status: "PENDING",
        isProrated,
        proratedDays: isProrated ? proratedDays : null,
        remarks: isProrated ? `Prorated for ${proratedDays} days` : `Monthly rent for ${month}/${year}`,
      });

      generatedCount++;
      generatedBills.push({
        id: insertResult[0].insertId,
        stayId: stay.id,
        userId: stay.userId,
        billAmount,
        isProrated,
      });
    }

    return {
      message: `Successfully generated ${generatedCount} monthly bills for ${month}/${year}`,
      generatedCount,
      bills: generatedBills,
    };
  }
}
