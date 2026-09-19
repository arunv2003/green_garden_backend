import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { config } from "../../config/index.js";
import {
  maintenanceBills,
  flats,
  blocks,
  floors,
  residents,
  payments,
  societies,
  auditLogs,
} from "../../db/schema/index.js";

export class MaintenanceService {
  /**
   * List all maintenance bills with Flat & Resident details
   */
  static async getAllBills(filters?: {
    search?: string;
    flatId?: number;
    residentId?: number;
    billingMonth?: number;
    billingYear?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    let conditions: any[] = [];

    if (filters?.flatId) conditions.push(eq(maintenanceBills.flatId, filters.flatId));
    if (filters?.residentId) conditions.push(eq(maintenanceBills.residentId, filters.residentId));
    if (filters?.billingMonth) conditions.push(eq(maintenanceBills.billingMonth, filters.billingMonth));
    if (filters?.billingYear) conditions.push(eq(maintenanceBills.billingYear, filters.billingYear));
    if (filters?.status && filters.status !== "ALL") {
      conditions.push(eq(maintenanceBills.status, filters.status as any));
    }

    const list = await db
      .select({
        id: maintenanceBills.id,
        societyId: maintenanceBills.societyId,
        flatId: maintenanceBills.flatId,
        residentId: maintenanceBills.residentId,
        billingMonth: maintenanceBills.billingMonth,
        billingYear: maintenanceBills.billingYear,
        baseAmount: maintenanceBills.baseAmount,
        additionalCharges: maintenanceBills.additionalCharges,
        lateFee: maintenanceBills.lateFee,
        discount: maintenanceBills.discount,
        totalAmount: maintenanceBills.totalAmount,
        paidAmount: maintenanceBills.paidAmount,
        pendingAmount: maintenanceBills.pendingAmount,
        dueDate: maintenanceBills.dueDate,
        status: maintenanceBills.status,
        remarks: maintenanceBills.remarks,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        blockName: blocks.name,
        floorNumber: floors.floorNumber,
        residentName: residents.fullName,
        residentMobile: residents.mobile,
        createdAt: maintenanceBills.createdAt,
      })
      .from(maintenanceBills)
      .leftJoin(flats, eq(maintenanceBills.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(floors, eq(flats.floorId, floors.id))
      .leftJoin(residents, eq(maintenanceBills.residentId, residents.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(maintenanceBills.billingYear), desc(maintenanceBills.billingMonth), flats.flatNumber);

    // Fetch all residents and all bills for accurate resident resolution and previous dues
    const allResidents = await db.select().from(residents);
    const allFlatBills = await db
      .select({
        id: maintenanceBills.id,
        flatId: maintenanceBills.flatId,
        billingMonth: maintenanceBills.billingMonth,
        billingYear: maintenanceBills.billingYear,
        pendingAmount: maintenanceBills.pendingAmount,
      })
      .from(maintenanceBills);

    const enriched = list.map((b) => {
      const monthStart = new Date(b.billingYear, b.billingMonth - 1, 1);
      const monthEnd = new Date(b.billingYear, b.billingMonth, 0, 23, 59, 59, 999);

      let resident: any = null;
      if (b.residentId) {
        const directRes = allResidents.find((r) => r.id === b.residentId);
        if (directRes) {
          const movedOutBefore = directRes.moveOutDate && new Date(directRes.moveOutDate) < monthStart;
          if (!movedOutBefore) {
            resident = directRes;
          }
        }
      }

      if (!resident) {
        resident =
          allResidents.find(
            (r) =>
              r.flatId === b.flatId &&
              new Date(r.moveInDate) <= monthEnd &&
              (!r.moveOutDate || new Date(r.moveOutDate) >= monthStart)
          ) || null;
      }

      if (!resident) {
        resident = allResidents.find((r) => r.flatId === b.flatId && r.status === "ACTIVE") || null;
      }

      const prevDues = allFlatBills
        .filter(
          (ob) =>
            ob.flatId === b.flatId &&
            (ob.billingYear < b.billingYear ||
              (ob.billingYear === b.billingYear && ob.billingMonth < b.billingMonth))
        )
        .reduce((sum, ob) => sum + parseFloat(ob.pendingAmount || "0"), 0);

      return {
        ...b,
        residentId: resident ? resident.id : null,
        residentName: resident ? resident.fullName : null,
        residentPhone: resident ? resident.mobile : null,
        residentMobile: resident ? resident.mobile : null,
        residentType: resident ? resident.residentType : null,
        previousDues: prevDues.toFixed(2),
      };
    });

    let filtered = enriched;
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.flatNumber?.toLowerCase().includes(q) ||
          b.residentName?.toLowerCase().includes(q) ||
          b.residentPhone?.includes(q) ||
          b.residentMobile?.includes(q) ||
          b.blockName?.toLowerCase().includes(q)
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

    // Financial totals of filtered set
    const totalBilled = filtered.reduce((acc, b) => acc + parseFloat(b.totalAmount), 0);
    const totalPaid = filtered.reduce((acc, b) => acc + parseFloat(b.paidAmount), 0);
    const totalPending = filtered.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);

    return {
      items,
      summary: {
        totalBilled,
        totalPaid,
        totalPending,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single bill details with payment allocations
   */
  static async getBillById(id: number) {
    const list = await db
      .select({
        id: maintenanceBills.id,
        societyId: maintenanceBills.societyId,
        flatId: maintenanceBills.flatId,
        residentId: maintenanceBills.residentId,
        billingMonth: maintenanceBills.billingMonth,
        billingYear: maintenanceBills.billingYear,
        baseAmount: maintenanceBills.baseAmount,
        additionalCharges: maintenanceBills.additionalCharges,
        lateFee: maintenanceBills.lateFee,
        discount: maintenanceBills.discount,
        totalAmount: maintenanceBills.totalAmount,
        paidAmount: maintenanceBills.paidAmount,
        pendingAmount: maintenanceBills.pendingAmount,
        dueDate: maintenanceBills.dueDate,
        status: maintenanceBills.status,
        remarks: maintenanceBills.remarks,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        blockName: blocks.name,
        floorNumber: floors.floorNumber,
        residentName: residents.fullName,
        residentMobile: residents.mobile,
        createdAt: maintenanceBills.createdAt,
      })
      .from(maintenanceBills)
      .leftJoin(flats, eq(maintenanceBills.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(floors, eq(flats.floorId, floors.id))
      .leftJoin(residents, eq(maintenanceBills.residentId, residents.id))
      .where(eq(maintenanceBills.id, id))
      .limit(1);

    if (list.length === 0) {
      throw new Error("Maintenance bill not found");
    }

    const bill = list[0];
    const allResidents = await db.select().from(residents);
    const monthStart = new Date(bill.billingYear, bill.billingMonth - 1, 1);
    const monthEnd = new Date(bill.billingYear, bill.billingMonth, 0, 23, 59, 59, 999);

    let resident: any = null;
    if (bill.residentId) {
      const directRes = allResidents.find((r) => r.id === bill.residentId);
      if (directRes && !(directRes.moveOutDate && new Date(directRes.moveOutDate) < monthStart)) {
        resident = directRes;
      }
    }
    if (!resident) {
      resident =
        allResidents.find(
          (r) =>
            r.flatId === bill.flatId &&
            new Date(r.moveInDate) <= monthEnd &&
            (!r.moveOutDate || new Date(r.moveOutDate) >= monthStart)
        ) || allResidents.find((r) => r.flatId === bill.flatId && r.status === "ACTIVE") || null;
    }

    const allFlatBills = await db
      .select({
        id: maintenanceBills.id,
        flatId: maintenanceBills.flatId,
        billingMonth: maintenanceBills.billingMonth,
        billingYear: maintenanceBills.billingYear,
        pendingAmount: maintenanceBills.pendingAmount,
      })
      .from(maintenanceBills)
      .where(eq(maintenanceBills.flatId, bill.flatId));

    const prevDues = allFlatBills
      .filter(
        (ob) =>
          ob.billingYear < bill.billingYear ||
          (ob.billingYear === bill.billingYear && ob.billingMonth < bill.billingMonth)
      )
      .reduce((sum, ob) => sum + parseFloat(ob.pendingAmount || "0"), 0);

    // Payments for this bill
    const billPayments = await db
      .select()
      .from(payments)
      .where(
        or(
          eq(payments.maintenanceBillId, id),
          and(
            eq(payments.flatId, bill.flatId),
            eq(payments.billingMonth, bill.billingMonth),
            eq(payments.billingYear, bill.billingYear)
          )
        )
      )
      .orderBy(desc(payments.paymentDate));

    return {
      ...bill,
      residentId: resident ? resident.id : null,
      residentName: resident ? resident.fullName : null,
      residentPhone: resident ? resident.mobile : null,
      residentMobile: resident ? resident.mobile : null,
      residentType: resident ? resident.residentType : null,
      previousDues: prevDues.toFixed(2),
      payments: billPayments,
    };
  }

  /**
   * Batch Monthly Bill Generator
   * Generates maintenance bills for all occupied flats in the society
   * Prevents duplicate bills for same flat + month + year
   */
  static async generateMonthlyBills(data: {
    billingMonth: number;
    billingYear: number;
    dueDate: string;
    additionalCharges?: number;
    remarks?: string;
  }, operatorId?: number) {
    const { billingMonth, billingYear, dueDate, additionalCharges = 0, remarks } = data;

    // 1. Fetch all ACTIVE flats
    const allFlats = await db
      .select()
      .from(flats)
      .where(eq(flats.status, "ACTIVE"));

    // 2. Fetch active residents mapped to flats
    const activeResidents = await db
      .select()
      .from(residents)
      .where(eq(residents.status, "ACTIVE"));

    // 3. Fetch existing bills for this month/year to prevent duplicates
    const existingBills = await db
      .select({ flatId: maintenanceBills.flatId })
      .from(maintenanceBills)
      .where(
        and(
          eq(maintenanceBills.billingMonth, billingMonth),
          eq(maintenanceBills.billingYear, billingYear)
        )
      );

    const existingFlatIds = new Set(existingBills.map((b) => b.flatId));

    let generatedCount = 0;
    let skippedCount = 0;
    const generatedBills: any[] = [];
    const daysInMonth = new Date(billingYear, billingMonth, 0).getDate();
    const monthStart = new Date(billingYear, billingMonth - 1, 1);
    const monthEnd = new Date(billingYear, billingMonth, 0, 23, 59, 59, 999);

    for (const flat of allFlats) {
      if (existingFlatIds.has(flat.id)) {
        skippedCount++;
        continue;
      }

      const resident =
        activeResidents.find(
          (r) =>
            r.flatId === flat.id &&
            new Date(r.moveInDate) <= monthEnd &&
            (!r.moveOutDate || new Date(r.moveOutDate) >= monthStart)
        ) || activeResidents.find((r) => r.flatId === flat.id);

      const monthlyMaintenance = parseFloat(flat.monthlyMaintenance);
      let baseAmount = monthlyMaintenance;
      let billRemarks = remarks || `Maintenance bill for ${billingMonth}/${billingYear}`;

      if (config.billingMode === "DAILY_PRORATED" && resident) {
        const moveInDate = new Date(resident.moveInDate);
        const inYear = moveInDate.getFullYear();
        const inMonth = moveInDate.getMonth() + 1;
        const inDay = moveInDate.getDate();

        if (inYear === billingYear && inMonth === billingMonth && inDay > 1) {
          const proratedDays = daysInMonth - inDay + 1;
          baseAmount = Math.round((monthlyMaintenance / daysInMonth) * proratedDays);
          billRemarks = `Prorated ${proratedDays} days from move-in (${inDay}/${billingMonth}/${billingYear})`;
        } else if (resident.moveOutDate) {
          const moveOutDate = new Date(resident.moveOutDate);
          const outYear = moveOutDate.getFullYear();
          const outMonth = moveOutDate.getMonth() + 1;
          const outDay = moveOutDate.getDate();

          if (outYear === billingYear && outMonth === billingMonth && outDay < daysInMonth) {
            const proratedDays = outDay;
            baseAmount = Math.round((monthlyMaintenance / daysInMonth) * proratedDays);
            billRemarks = `Prorated ${proratedDays} days up to move-out (${outDay}/${billingMonth}/${billingYear})`;
          }
        }
      } else if (!resident) {
        billRemarks = `Vacant flat maintenance for ${billingMonth}/${billingYear}`;
      }

      const totalAmount = baseAmount + additionalCharges;

      const res = await db.insert(maintenanceBills).values({
        societyId: flat.societyId || 1,
        flatId: flat.id,
        residentId: resident ? resident.id : null,
        billingMonth,
        billingYear,
        baseAmount: baseAmount.toFixed(2),
        additionalCharges: additionalCharges.toFixed(2),
        lateFee: "0.00",
        discount: "0.00",
        totalAmount: totalAmount.toFixed(2),
        paidAmount: "0.00",
        pendingAmount: totalAmount.toFixed(2),
        dueDate,
        status: "UNPAID",
        remarks: billRemarks,
      });

      generatedCount++;
      generatedBills.push({
        id: res[0].insertId,
        flatNumber: flat.flatNumber,
        totalAmount,
      });
    }

    if (operatorId) {
      await db.insert(auditLogs).values({
        userId: operatorId,
        action: "GENERATE_MONTHLY_BILLS",
        module: "MAINTENANCE",
        recordId: billingMonth,
        newData: JSON.stringify({ billingMonth, billingYear, generatedCount, skippedCount }),
      });
    }

    return {
      success: true,
      billingMonth,
      billingYear,
      generatedCount,
      skippedCount,
      totalFlats: allFlats.length,
      generatedBills,
    };
  }

  /**
   * Create single maintenance bill
   */
  static async createBill(data: any, operatorId?: number) {
    // Check duplicate
    const existing = await db
      .select()
      .from(maintenanceBills)
      .where(
        and(
          eq(maintenanceBills.flatId, data.flatId),
          eq(maintenanceBills.billingMonth, data.billingMonth),
          eq(maintenanceBills.billingYear, data.billingYear)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`A maintenance bill for Flat ID ${data.flatId} for ${data.billingMonth}/${data.billingYear} already exists.`);
    }

    const baseAmount = data.baseAmount;
    const addCharges = data.additionalCharges || 0;
    const lateFee = data.lateFee || 0;
    const discount = data.discount || 0;
    const totalAmount = baseAmount + addCharges + lateFee - discount;

    const res = await db.insert(maintenanceBills).values({
      societyId: 1,
      flatId: data.flatId,
      residentId: data.residentId || null,
      billingMonth: data.billingMonth,
      billingYear: data.billingYear,
      baseAmount: baseAmount.toFixed(2),
      additionalCharges: addCharges.toFixed(2),
      lateFee: lateFee.toFixed(2),
      discount: discount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      paidAmount: "0.00",
      pendingAmount: totalAmount.toFixed(2),
      dueDate: data.dueDate,
      status: "UNPAID",
      remarks: data.remarks || null,
    });

    return this.getBillById(res[0].insertId);
  }

  /**
   * Update Bill adjustments or due date
   */
  static async updateBill(id: number, data: any) {
    const existing = await db.select().from(maintenanceBills).where(eq(maintenanceBills.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Bill not found");
    }

    const bill = existing[0];
    const baseAmount = data.baseAmount !== undefined ? parseFloat(data.baseAmount) : parseFloat(bill.baseAmount);
    const addCharges = data.additionalCharges !== undefined ? data.additionalCharges : parseFloat(bill.additionalCharges);
    const lateFee = data.lateFee !== undefined ? data.lateFee : parseFloat(bill.lateFee);
    const discount = data.discount !== undefined ? data.discount : parseFloat(bill.discount);
    const paidAmount = parseFloat(bill.paidAmount);

    const totalAmount = baseAmount + addCharges + lateFee - discount;
    const pendingAmount = Math.max(0, totalAmount - paidAmount);

    let status = bill.status;
    if (paidAmount >= totalAmount) status = "PAID";
    else if (paidAmount > 0) status = "PARTIAL";
    else status = "UNPAID";

    if (data.status) status = data.status;

    await db
      .update(maintenanceBills)
      .set({
        baseAmount: baseAmount.toFixed(2),
        additionalCharges: addCharges.toFixed(2),
        lateFee: lateFee.toFixed(2),
        discount: discount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        pendingAmount: pendingAmount.toFixed(2),
        status,
        dueDate: data.dueDate || bill.dueDate,
        remarks: data.remarks !== undefined ? data.remarks : bill.remarks,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceBills.id, id));

    return this.getBillById(id);
  }

  static async deleteBill(id: number) {
    const existing = await db.select().from(maintenanceBills).where(eq(maintenanceBills.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Bill not found");
    }
    await db.delete(maintenanceBills).where(eq(maintenanceBills.id, id));
    return { success: true, message: "Maintenance bill deleted successfully" };
  }
}
