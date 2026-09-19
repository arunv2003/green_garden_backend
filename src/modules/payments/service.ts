import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  payments,
  paymentAllocations,
  maintenanceBills,
  monthlyBills,
  users,
  flats,
  blocks,
  residents,
  rooms,
  auditLogs,
} from "../../db/schema/index.js";
import { generateReceiptNumber } from "../../utils/receipt.js";

export class PaymentService {
  static async getAllPayments(filters?: {
    userId?: number;
    residentId?: number;
    flatId?: number;
    roomId?: number;
    month?: number;
    year?: number;
    paymentMethod?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let query = db
      .select({
        id: payments.id,
        societyId: payments.societyId,
        userId: payments.userId,
        userName: users.name,
        userMobile: users.mobile,
        residentId: payments.residentId,
        residentName: residents.fullName,
        flatId: payments.flatId,
        flatNumber: flats.flatNumber,
        blockName: blocks.name,
        roomId: payments.roomId,
        roomNumber: rooms.roomNumber,
        stayId: payments.stayId,
        maintenanceBillId: payments.maintenanceBillId,
        monthlyBillId: payments.monthlyBillId,
        billingMonth: payments.billingMonth,
        billingYear: payments.billingYear,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        transactionId: payments.transactionId,
        receiptNumber: payments.receiptNumber,
        status: payments.status,
        previousPending: payments.previousPending,
        remainingPending: payments.remainingPending,
        remarks: payments.remarks,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(residents, eq(payments.residentId, residents.id))
      .leftJoin(flats, eq(payments.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(rooms, eq(payments.roomId, rooms.id))
      .orderBy(desc(payments.paymentDate), desc(payments.id));

    const allPayments = await query;

    const filtered = allPayments.filter((p) => {
      if (filters?.userId && p.userId !== filters.userId) return false;
      if (filters?.residentId && p.residentId !== filters.residentId) return false;
      if (filters?.flatId && p.flatId !== filters.flatId) return false;
      if (filters?.roomId && p.roomId !== filters.roomId) return false;
      if (filters?.month && p.billingMonth !== filters.month) return false;
      if (filters?.year && p.billingYear !== filters.year) return false;
      if (filters?.paymentMethod && filters.paymentMethod !== "ALL" && p.paymentMethod !== filters.paymentMethod) return false;
      if (filters?.status && filters.status !== "ALL" && p.status !== filters.status) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        const displayFlat = p.flatNumber || p.roomNumber || "";
        const displayName = p.residentName || p.userName || "";
        const matches =
          displayName.toLowerCase().includes(q) ||
          displayFlat.toLowerCase().includes(q) ||
          p.receiptNumber?.toLowerCase().includes(q) ||
          p.userMobile?.includes(q) ||
          (p.transactionId && p.transactionId.toLowerCase().includes(q));
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

    const totalCollected = filtered.reduce((acc, p) => acc + (p.status === "PAID" ? parseFloat(p.amount) : 0), 0);

    return {
      items,
      summary: {
        totalCollected,
        totalTransactions: total,
      },
      meta: {
        total,
        page,
        limit: filters?.limit || total,
        totalPages: filters?.limit ? Math.ceil(total / limit) || 1 : 1,
      },
    };
  }

  static async getPaymentById(id: number) {
    const paymentRecords = await db
      .select({
        id: payments.id,
        societyId: payments.societyId,
        userId: payments.userId,
        userName: users.name,
        userEmail: users.email,
        userMobile: users.mobile,
        residentId: payments.residentId,
        residentName: residents.fullName,
        flatId: payments.flatId,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        blockName: blocks.name,
        roomId: payments.roomId,
        roomNumber: rooms.roomNumber,
        stayId: payments.stayId,
        maintenanceBillId: payments.maintenanceBillId,
        monthlyBillId: payments.monthlyBillId,
        billingMonth: payments.billingMonth,
        billingYear: payments.billingYear,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        transactionId: payments.transactionId,
        receiptNumber: payments.receiptNumber,
        status: payments.status,
        previousPending: payments.previousPending,
        remainingPending: payments.remainingPending,
        remarks: payments.remarks,
        createdBy: payments.createdBy,
        verifiedBy: payments.verifiedBy,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(residents, eq(payments.residentId, residents.id))
      .leftJoin(flats, eq(payments.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(rooms, eq(payments.roomId, rooms.id))
      .where(eq(payments.id, id))
      .limit(1);

    if (paymentRecords.length === 0) {
      throw new Error("Payment record not found");
    }

    return paymentRecords[0];
  }

  static async getReceipt(paymentId: number) {
    const payment = await this.getPaymentById(paymentId);

    // Fetch creator/receiver details
    let receiverName = "Accounts Desk";
    if (payment.createdBy) {
      const creator = await db
        .select({ name: users.name, role: users.role })
        .from(users)
        .where(eq(users.id, payment.createdBy))
        .limit(1);
      if (creator.length > 0) {
        receiverName = `${creator[0].name} (${creator[0].role})`;
      }
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const displayFlat = payment.flatNumber || payment.roomNumber || "Flat";
    const displayName = payment.residentName || payment.userName || "Resident";

    return {
      societyName: "GREEN GARDEN RESIDENTIAL SOCIETY",
      tagline: "Maintenance & Facility Management",
      address: "Plot 12, Green Garden Enclave, Gomti Nagar, Lucknow, UP - 226010",
      receiptNumber: payment.receiptNumber,
      paymentId: payment.id,
      paymentDate: payment.paymentDate,
      residentName: displayName,
      residentEmail: payment.userEmail,
      residentMobile: payment.userMobile,
      flatNumber: displayFlat,
      blockName: payment.blockName || "Tower A",
      billingPeriod: `${monthNames[payment.billingMonth - 1]} ${payment.billingYear}`,
      amount: parseFloat(payment.amount),
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId || "N/A",
      status: payment.status,
      previousPending: parseFloat(payment.previousPending),
      currentPayment: parseFloat(payment.amount),
      remainingPending: parseFloat(payment.remainingPending),
      receivedBy: receiverName,
      remarks: payment.remarks || "Payment received with thanks.",
      issuedAt: payment.createdAt,
    };
  }

  static async createPayment(data: any, createdByUserId: number) {
    const paymentAmount = parseFloat(data.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    const targetFlatId = data.flatId || data.roomId;
    const targetResidentId = data.residentId || data.stayId;

    let targetUserId = data.userId;
    if (!targetUserId && targetResidentId) {
      const rList = await db
        .select({ userId: residents.userId })
        .from(residents)
        .where(eq(residents.id, targetResidentId))
        .limit(1);
      if (rList.length > 0 && rList[0].userId) {
        targetUserId = rList[0].userId;
      }
    }
    if (!targetUserId) targetUserId = createdByUserId;

    let previousPending = 0;
    let targetMaintenanceBill: any = null;

    if (data.maintenanceBillId) {
      const bill = await db
        .select()
        .from(maintenanceBills)
        .where(eq(maintenanceBills.id, data.maintenanceBillId))
        .limit(1);
      if (bill.length > 0) {
        targetMaintenanceBill = bill[0];
        previousPending = parseFloat(targetMaintenanceBill.pendingAmount);
      }
    } else if (targetFlatId) {
      // Try to find matching maintenance bill for flat + month + year
      const bMonth = data.billingMonth || new Date().getMonth() + 1;
      const bYear = data.billingYear || new Date().getFullYear();
      const matched = await db
        .select()
        .from(maintenanceBills)
        .where(
          and(
            eq(maintenanceBills.flatId, targetFlatId),
            eq(maintenanceBills.billingMonth, bMonth),
            eq(maintenanceBills.billingYear, bYear)
          )
        )
        .limit(1);

      if (matched.length > 0) {
        targetMaintenanceBill = matched[0];
        previousPending = parseFloat(targetMaintenanceBill.pendingAmount);
      } else {
        const flatBills = await db
          .select()
          .from(maintenanceBills)
          .where(eq(maintenanceBills.flatId, targetFlatId));
        previousPending = flatBills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
      }
    } else if (targetUserId) {
      const userBills = await db
        .select()
        .from(monthlyBills)
        .where(eq(monthlyBills.userId, targetUserId));
      previousPending = userBills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
    }

    const remainingPending = Math.max(0, previousPending - paymentAmount);
    const receiptNumber = generateReceiptNumber();

    const insertPayload: any = {
      societyId: data.societyId || 1,
      flatId: targetFlatId || null,
      residentId: targetResidentId || null,
      roomId: data.roomId || targetFlatId || null,
      stayId: data.stayId || targetResidentId || null,
      userId: targetUserId,
      maintenanceBillId: targetMaintenanceBill ? targetMaintenanceBill.id : (data.maintenanceBillId || null),
      monthlyBillId: data.monthlyBillId || null,
      billingMonth: data.billingMonth || new Date().getMonth() + 1,
      billingYear: data.billingYear || new Date().getFullYear(),
      amount: paymentAmount.toFixed(2),
      paymentDate: data.paymentDate || new Date().toISOString().slice(0, 10),
      paymentMethod: data.paymentMethod || "CASH",
      transactionId: data.transactionId ? data.transactionId.trim() : null,
      receiptNumber,
      status: "PAID",
      previousPending: previousPending.toFixed(2),
      remainingPending: remainingPending.toFixed(2),
      remarks: data.remarks || null,
      createdBy: createdByUserId,
    };

    const res = await db.insert(payments).values(insertPayload);
    const paymentId = res[0].insertId;

    // If linked to maintenance bill, update bill paid and pending
    if (targetMaintenanceBill) {
      const newPaid = parseFloat(targetMaintenanceBill.paidAmount) + paymentAmount;
      const newPending = Math.max(0, parseFloat(targetMaintenanceBill.totalAmount) - newPaid);
      const newStatus = newPending <= 0 ? "PAID" : "PARTIAL";

      await db
        .update(maintenanceBills)
        .set({
          paidAmount: newPaid.toFixed(2),
          pendingAmount: newPending.toFixed(2),
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(maintenanceBills.id, targetMaintenanceBill.id));

      await db.insert(paymentAllocations).values({
        paymentId,
        maintenanceBillId: targetMaintenanceBill.id,
        allocatedAmount: paymentAmount.toFixed(2),
      });
    }

    await db.insert(auditLogs).values({
      userId: createdByUserId,
      action: "RECORD_PAYMENT",
      module: "PAYMENTS",
      recordId: paymentId,
      newData: JSON.stringify({ amount: paymentAmount, receiptNumber, flatId: targetFlatId }),
    });

    return this.getPaymentById(paymentId);
  }

  static async updatePayment(id: number, data: any) {
    const existing = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (existing.length === 0) throw new Error("Payment record not found");

    const payload: any = { updatedAt: new Date() };
    if (data.paymentMethod !== undefined) payload.paymentMethod = data.paymentMethod;
    if (data.transactionId !== undefined) payload.transactionId = data.transactionId;
    if (data.remarks !== undefined) payload.remarks = data.remarks;
    if (data.status !== undefined) payload.status = data.status;

    await db.update(payments).set(payload).where(eq(payments.id, id));
    return this.getPaymentById(id);
  }

  static async deletePayment(id: number) {
    const existing = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (existing.length === 0) throw new Error("Payment record not found");

    const payment = existing[0];
    if (payment.maintenanceBillId) {
      const bill = await db
        .select()
        .from(maintenanceBills)
        .where(eq(maintenanceBills.id, payment.maintenanceBillId))
        .limit(1);

      if (bill.length > 0) {
        const paidAmount = Math.max(0, parseFloat(bill[0].paidAmount) - parseFloat(payment.amount));
        const totalAmount = parseFloat(bill[0].totalAmount);
        const pendingAmount = Math.max(0, totalAmount - paidAmount);
        let status: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";
        if (paidAmount >= totalAmount) status = "PAID";
        else if (paidAmount > 0) status = "PARTIAL";

        await db
          .update(maintenanceBills)
          .set({
            paidAmount: paidAmount.toFixed(2),
            pendingAmount: pendingAmount.toFixed(2),
            status,
            updatedAt: new Date(),
          })
          .where(eq(maintenanceBills.id, bill[0].id));
      }
    }

    await db.delete(payments).where(eq(payments.id, id));
    return { success: true, message: "Payment transaction deleted successfully" };
  }
}
