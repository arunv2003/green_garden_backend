import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  flats,
  blocks,
  floors,
  residents,
  familyMembers,
  vehicles,
  maintenanceBills,
  payments,
  visitors,
  complaints,
  users,
} from "../../db/schema/index.js";

export class FlatService {
  /**
   * List all flats with Block & Floor info, current occupants, and pending maintenance summary
   */
  static async getAllFlats(filters?: {
    search?: string;
    blockId?: number;
    floorId?: number;
    occupancyStatus?: string;
    page?: number;
    limit?: number;
  }) {
    let conditions: any[] = [eq(flats.status, "ACTIVE")];

    if (filters?.blockId) {
      conditions.push(eq(flats.blockId, filters.blockId));
    }
    if (filters?.floorId) {
      conditions.push(eq(flats.floorId, filters.floorId));
    }
    if (filters?.occupancyStatus && filters.occupancyStatus !== "ALL") {
      conditions.push(eq(flats.occupancyStatus, filters.occupancyStatus as any));
    }

    const flatList = await db
      .select({
        id: flats.id,
        societyId: flats.societyId,
        blockId: flats.blockId,
        blockName: blocks.name,
        blockCode: blocks.code,
        floorId: flats.floorId,
        floorNumber: floors.floorNumber,
        floorName: floors.name,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        areaSqft: flats.areaSqft,
        bedrooms: flats.bedrooms,
        bathrooms: flats.bathrooms,
        occupancyStatus: flats.occupancyStatus,
        ownershipStatus: flats.ownershipStatus,
        monthlyMaintenance: flats.monthlyMaintenance,
        status: flats.status,
        createdAt: flats.createdAt,
        updatedAt: flats.updatedAt,
      })
      .from(flats)
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(floors, eq(flats.floorId, floors.id))
      .where(and(...conditions))
      .orderBy(flats.flatNumber);

    // Fetch active residents for these flats
    const activeResidents = await db
      .select()
      .from(residents)
      .where(eq(residents.status, "ACTIVE"));

    // Fetch pending maintenance amounts per flat
    const pendingSums = await db
      .select({
        flatId: maintenanceBills.flatId,
        totalPending: sql<string>`COALESCE(SUM(${maintenanceBills.pendingAmount}), 0)`,
      })
      .from(maintenanceBills)
      .groupBy(maintenanceBills.flatId);

    const pendingMap = new Map<number, number>();
    pendingSums.forEach((p) => pendingMap.set(p.flatId, parseFloat(p.totalPending)));

    let enriched = flatList.map((f) => {
      const flatRes = activeResidents.filter((r) => r.flatId === f.id);
      const owner = flatRes.find((r) => r.residentType === "OWNER");
      const tenant = flatRes.find((r) => r.residentType === "TENANT");
      const primaryRes = tenant || owner || (flatRes.length > 0 ? flatRes[0] : null);
      const currentResident = primaryRes
        ? {
            id: primaryRes.id,
            userId: primaryRes.userId,
            flatId: primaryRes.flatId,
            residentType: primaryRes.residentType,
            name: primaryRes.fullName,
            fullName: primaryRes.fullName,
            phone: primaryRes.mobile,
            mobile: primaryRes.mobile,
            email: primaryRes.email,
            moveInDate: primaryRes.moveInDate,
            status: primaryRes.status,
          }
        : null;

      return {
        ...f,
        currentResident,
        currentOwner: owner ? { ...owner, name: owner.fullName, phone: owner.mobile } : null,
        currentTenant: tenant ? { ...tenant, name: tenant.fullName, phone: tenant.mobile } : null,
        totalOccupants: flatRes.length,
        totalPendingMaintenance: pendingMap.get(f.id) || 0,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      enriched = enriched.filter(
        (f) =>
          f.flatNumber.toLowerCase().includes(q) ||
          f.blockName?.toLowerCase().includes(q) ||
          f.flatType.toLowerCase().includes(q) ||
          (f.currentResident?.fullName && f.currentResident.fullName.toLowerCase().includes(q)) ||
          (f.currentOwner?.fullName && f.currentOwner.fullName.toLowerCase().includes(q)) ||
          (f.currentTenant?.fullName && f.currentTenant.fullName.toLowerCase().includes(q))
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
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * 360° Comprehensive Flat Details
   * Everything related to a flat from one single view
   */
  static async getFlatDetails(idOrNumber: string | number) {
    let condition = typeof idOrNumber === "number" || !isNaN(Number(idOrNumber))
      ? eq(flats.id, Number(idOrNumber))
      : eq(flats.flatNumber, String(idOrNumber).trim());

    const flatRecords = await db
      .select({
        id: flats.id,
        societyId: flats.societyId,
        blockId: flats.blockId,
        blockName: blocks.name,
        blockCode: blocks.code,
        floorId: flats.floorId,
        floorNumber: floors.floorNumber,
        floorName: floors.name,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        areaSqft: flats.areaSqft,
        bedrooms: flats.bedrooms,
        bathrooms: flats.bathrooms,
        occupancyStatus: flats.occupancyStatus,
        ownershipStatus: flats.ownershipStatus,
        monthlyMaintenance: flats.monthlyMaintenance,
        status: flats.status,
        createdAt: flats.createdAt,
        updatedAt: flats.updatedAt,
      })
      .from(flats)
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(floors, eq(flats.floorId, floors.id))
      .where(condition)
      .limit(1);

    if (flatRecords.length === 0) {
      throw new Error(`Flat '${idOrNumber}' not found`);
    }

    const flat = flatRecords[0];
    const flatId = flat.id;

    // 1. All residents for this flat (active and historical)
    const allResidents = await db
      .select()
      .from(residents)
      .where(eq(residents.flatId, flatId))
      .orderBy(desc(residents.moveInDate));

    const currentOwner = allResidents.find((r) => r.residentType === "OWNER" && r.status === "ACTIVE") || null;
    const currentTenant = allResidents.find((r) => r.residentType === "TENANT" && r.status === "ACTIVE") || null;
    const activeRes = allResidents.filter((r) => r.status === "ACTIVE");
    const primaryResident = currentTenant || currentOwner || (activeRes.length > 0 ? activeRes[0] : null);
    const currentResident = primaryResident
      ? {
          ...primaryResident,
          name: primaryResident.fullName,
          fullName: primaryResident.fullName,
          phone: primaryResident.mobile,
          mobile: primaryResident.mobile,
        }
      : null;
    const previousResidents = allResidents.filter((r) => r.status === "INACTIVE");

    // 2. Family members of current active residents
    const activeResidentIds = allResidents.filter((r) => r.status === "ACTIVE").map((r) => r.id);
    let currentFamilyMembers: any[] = [];
    if (activeResidentIds.length > 0) {
      const allFM = await db.select().from(familyMembers).where(eq(familyMembers.status, "ACTIVE"));
      currentFamilyMembers = allFM.filter((fm) => activeResidentIds.includes(fm.residentId));
    }

    // 3. Vehicles registered for this flat
    const flatVehicles = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.flatId, flatId), eq(vehicles.status, "ACTIVE")));

    // 4. Maintenance Bills for this flat
    const bills = await db
      .select()
      .from(maintenanceBills)
      .where(eq(maintenanceBills.flatId, flatId))
      .orderBy(desc(maintenanceBills.billingYear), desc(maintenanceBills.billingMonth));

    const totalBilled = bills.reduce((acc, b) => acc + parseFloat(b.totalAmount), 0);
    const totalPaid = bills.reduce((acc, b) => acc + parseFloat(b.paidAmount), 0);
    const totalPending = bills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);

    // Current latest bill
    const currentBill = bills[0] || null;

    // 5. Payment History
    const paymentHistory = await db
      .select()
      .from(payments)
      .where(or(eq(payments.flatId, flatId), eq(payments.roomId, flatId)))
      .orderBy(desc(payments.paymentDate));

    // 6. Visitor History for this flat
    const visitorHistory = await db
      .select()
      .from(visitors)
      .where(eq(visitors.flatId, flatId))
      .orderBy(desc(visitors.entryDate), desc(visitors.entryTime));

    // 7. Complaints for this flat
    const flatComplaints = await db
      .select()
      .from(complaints)
      .where(eq(complaints.flatId, flatId))
      .orderBy(desc(complaints.createdAt));

    return {
      flat,
      currentResident,
      currentOwner: currentOwner ? { ...currentOwner, name: currentOwner.fullName, phone: currentOwner.mobile } : null,
      currentTenant: currentTenant ? { ...currentTenant, name: currentTenant.fullName, phone: currentTenant.mobile } : null,
      previousResidents,
      familyMembers: currentFamilyMembers,
      vehicles: flatVehicles,
      maintenanceSummary: {
        currentBill,
        totalBilled,
        totalPaid,
        totalPending,
      },
      bills,
      payments: paymentHistory,
      visitors: visitorHistory,
      complaints: flatComplaints,
    };
  }

  static async createFlat(data: any) {
    const existing = await db
      .select()
      .from(flats)
      .where(eq(flats.flatNumber, data.flatNumber.trim()))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Flat number '${data.flatNumber}' already exists.`);
    }

    const res = await db.insert(flats).values({
      societyId: data.societyId || 1,
      blockId: data.blockId,
      floorId: data.floorId,
      flatNumber: data.flatNumber.trim(),
      flatType: data.flatType || "2BHK",
      areaSqft: data.areaSqft || 1200,
      bedrooms: data.bedrooms || 2,
      bathrooms: data.bathrooms || 2,
      monthlyMaintenance: data.monthlyMaintenance || 3000,
      occupancyStatus: data.occupancyStatus || "VACANT",
      ownershipStatus: data.ownershipStatus || "VACANT",
      status: "ACTIVE",
    });

    return this.getFlatDetails(res[0].insertId);
  }

  static async updateFlat(id: number, data: any) {
    const existing = await db.select().from(flats).where(eq(flats.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Flat not found");
    }

    if (data.flatNumber && data.flatNumber.trim() !== existing[0].flatNumber) {
      const conflict = await db
        .select()
        .from(flats)
        .where(eq(flats.flatNumber, data.flatNumber.trim()))
        .limit(1);
      if (conflict.length > 0) {
        throw new Error(`Flat number '${data.flatNumber}' is already in use.`);
      }
    }

    await db.update(flats).set({ ...data, updatedAt: new Date() }).where(eq(flats.id, id));
    return this.getFlatDetails(id);
  }

  static async deleteFlat(id: number) {
    // Check if flat has active residents
    const activeRes = await db
      .select()
      .from(residents)
      .where(and(eq(residents.flatId, id), eq(residents.status, "ACTIVE")))
      .limit(1);

    if (activeRes.length > 0) {
      throw new Error("Cannot deactivate flat with active residents. Please move out residents first.");
    }

    await db.update(flats).set({ status: "INACTIVE", updatedAt: new Date() }).where(eq(flats.id, id));
    return { success: true, message: "Flat deactivated successfully" };
  }
}
