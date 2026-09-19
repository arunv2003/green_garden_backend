import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  residents,
  flats,
  blocks,
  floors,
  users,
  familyMembers,
  vehicles,
  maintenanceBills,
  payments,
  auditLogs,
} from "../../db/schema/index.js";
import { hashPassword } from "../../utils/hash.js";

export class ResidentService {
  /**
   * List all residents with Flat details
   */
  static async getAllResidents(filters?: {
    search?: string;
    flatId?: number;
    residentType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    let conditions: any[] = [];

    if (filters?.flatId) {
      conditions.push(eq(residents.flatId, filters.flatId));
    }
    if (filters?.residentType && filters.residentType !== "ALL") {
      conditions.push(eq(residents.residentType, filters.residentType as any));
    }
    if (filters?.status && filters.status !== "ALL") {
      conditions.push(eq(residents.status, filters.status as any));
    } else {
      // Default to active unless explicitly asking for ALL or INACTIVE
      if (!filters?.status) {
        conditions.push(eq(residents.status, "ACTIVE"));
      }
    }

    const list = await db
      .select({
        id: residents.id,
        userId: residents.userId,
        flatId: residents.flatId,
        residentType: residents.residentType,
        fullName: residents.fullName,
        mobile: residents.mobile,
        email: residents.email,
        gender: residents.gender,
        dateOfBirth: residents.dateOfBirth,
        idProofType: residents.idProofType,
        idProofNumber: residents.idProofNumber,
        moveInDate: residents.moveInDate,
        moveOutDate: residents.moveOutDate,
        status: residents.status,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        blockName: blocks.name,
        floorNumber: floors.floorNumber,
        monthlyMaintenance: flats.monthlyMaintenance,
        createdAt: residents.createdAt,
      })
      .from(residents)
      .leftJoin(flats, eq(residents.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(floors, eq(flats.floorId, floors.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(residents.moveInDate));

    let filtered = list;
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.flatNumber && r.flatNumber.toLowerCase().includes(q)) ||
          (r.blockName && r.blockName.toLowerCase().includes(q))
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

    const enrichedItems = items.map((r) => ({
      ...r,
      name: r.fullName,
      userName: r.fullName,
      phone: r.mobile,
      userPhone: r.mobile,
      userEmail: r.email,
    }));

    return {
      items: enrichedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single resident by ID with flat, family, vehicles, and billing details
   */
  static async getResidentById(id: number) {
    const list = await db
      .select({
        id: residents.id,
        userId: residents.userId,
        flatId: residents.flatId,
        residentType: residents.residentType,
        fullName: residents.fullName,
        mobile: residents.mobile,
        email: residents.email,
        gender: residents.gender,
        dateOfBirth: residents.dateOfBirth,
        idProofType: residents.idProofType,
        idProofNumber: residents.idProofNumber,
        moveInDate: residents.moveInDate,
        moveOutDate: residents.moveOutDate,
        status: residents.status,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        blockName: blocks.name,
        floorNumber: floors.floorNumber,
        monthlyMaintenance: flats.monthlyMaintenance,
        createdAt: residents.createdAt,
      })
      .from(residents)
      .leftJoin(flats, eq(residents.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(floors, eq(flats.floorId, floors.id))
      .where(eq(residents.id, id))
      .limit(1);

    if (list.length === 0) {
      throw new Error("Resident not found");
    }

    const resident = {
      ...list[0],
      name: list[0].fullName,
      userName: list[0].fullName,
      phone: list[0].mobile,
      userPhone: list[0].mobile,
      userEmail: list[0].email,
    };

    // Family members
    const fmList = await db
      .select()
      .from(familyMembers)
      .where(and(eq(familyMembers.residentId, id), eq(familyMembers.status, "ACTIVE")));

    // Vehicles
    const vhList = await db
      .select()
      .from(vehicles)
      .where(
        and(
          or(eq(vehicles.residentId, id), eq(vehicles.flatId, resident.flatId)),
          eq(vehicles.status, "ACTIVE")
        )
      );

    // Maintenance Bills
    const bills = await db
      .select()
      .from(maintenanceBills)
      .where(eq(maintenanceBills.flatId, resident.flatId))
      .orderBy(desc(maintenanceBills.billingYear), desc(maintenanceBills.billingMonth));

    // Payments
    const payList = await db
      .select()
      .from(payments)
      .where(
        or(eq(payments.residentId, id), eq(payments.flatId, resident.flatId))
      )
      .orderBy(desc(payments.paymentDate));

    return {
      ...resident,
      familyMembers: fmList,
      vehicles: vhList,
      bills,
      payments: payList,
    };
  }

  /**
   * Add a new Resident (Owner or Tenant)
   */
  static async addResident(data: any, operatorId?: number) {
    const rawMobile = String(data.mobile || data.phone || "");
    const cleanMobile = rawMobile.trim();
    const rawName = String(data.fullName || data.name || "");
    const cleanName = rawName.trim();
    const cleanEmail = data.email && data.email.trim() ? data.email.trim() : `${cleanMobile}@greengarden.local`;

    // 1. Check or create user in users table
    let userId = data.userId;
    if (!userId) {
      const existingUser = await db
        .select()
        .from(users)
        .where(or(eq(users.mobile, cleanMobile), eq(users.email, cleanEmail)))
        .limit(1);

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const hashedPassword = await hashPassword(data.password || "User@123");
        const userRes = await db.insert(users).values({
          name: cleanName,
          email: cleanEmail,
          mobile: cleanMobile,
          password: hashedPassword,
          role: "USER",
          status: "ACTIVE",
          idProofType: data.idProofType || "Aadhaar Card",
          idProofNumber: data.idProofNumber || null,
          joiningDate: data.moveInDate || new Date().toISOString().slice(0, 10),
        });
        userId = userRes[0].insertId;
      }
    }

    // 2. Insert into residents table
    const res = await db.insert(residents).values({
      userId,
      flatId: data.flatId,
      residentType: data.residentType || "TENANT",
      fullName: cleanName,
      mobile: cleanMobile,
      email: data.email ? data.email.trim() : null,
      gender: data.gender || "MALE",
      dateOfBirth: data.dateOfBirth || null,
      idProofType: data.idProofType || "Aadhaar Card",
      idProofNumber: data.idProofNumber || null,
      moveInDate: data.moveInDate || new Date().toISOString().slice(0, 10),
      status: "ACTIVE",
    });

    const newResidentId = res[0].insertId;

    // 3. Update flat status to OCCUPIED
    const ownershipStatus = data.residentType === "OWNER" ? "OWNER_OCCUPIED" : "TENANT_OCCUPIED";
    await db
      .update(flats)
      .set({
        occupancyStatus: "OCCUPIED",
        ownershipStatus,
        updatedAt: new Date(),
      })
      .where(eq(flats.id, data.flatId));

    // Audit log
    if (operatorId) {
      await db.insert(auditLogs).values({
        userId: operatorId,
        action: `ADD_RESIDENT_${data.residentType || "TENANT"}`,
        module: "RESIDENTS",
        recordId: newResidentId,
        newData: JSON.stringify({ fullName: cleanName, flatId: data.flatId, type: data.residentType }),
      });
    }

    return this.getResidentById(newResidentId);
  }

  /**
   * Update Resident Information
   */
  static async updateResident(id: number, data: any, operatorId?: number) {
    const existing = await db.select().from(residents).where(eq(residents.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Resident not found");
    }

    const payload: any = { ...data, updatedAt: new Date() };
    const rawName = data.fullName || data.name;
    if (rawName) payload.fullName = String(rawName).trim();
    const rawMobile = data.mobile || data.phone;
    if (rawMobile) payload.mobile = String(rawMobile).trim();
    if (data.email) payload.email = data.email.trim();

    delete payload.name;
    delete payload.phone;
    delete payload.emergencyContactName;
    delete payload.emergencyContactPhone;

    await db.update(residents).set(payload).where(eq(residents.id, id));

    // Also update users table name/mobile
    if (existing[0].userId) {
      await db.update(users).set({
        name: payload.fullName || existing[0].fullName,
        mobile: payload.mobile || existing[0].mobile,
        email: payload.email || undefined,
        updatedAt: new Date(),
      }).where(eq(users.id, existing[0].userId));
    }

    return this.getResidentById(id);
  }

  /**
   * Move Out Resident
   * Records historical move out date and updates flat occupancy status
   */
  static async moveOutResident(id: number, moveOutData: any, operatorId?: number) {
    const existing = await db.select().from(residents).where(eq(residents.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Resident not found");
    }

    const residentRecord = existing[0];
    const flatId = residentRecord.flatId;
    const moveOutDate = moveOutData.moveOutDate || new Date().toISOString().slice(0, 10);

    // 1. Mark resident as INACTIVE with move_out_date
    await db
      .update(residents)
      .set({
        status: "INACTIVE",
        moveOutDate,
        updatedAt: new Date(),
      })
      .where(eq(residents.id, id));

    // 2. Check if any other ACTIVE residents remain in this flat
    const remainingActive = await db
      .select()
      .from(residents)
      .where(and(eq(residents.flatId, flatId), eq(residents.status, "ACTIVE")));

    if (remainingActive.length === 0) {
      // Set flat to VACANT
      await db
        .update(flats)
        .set({
          occupancyStatus: "VACANT",
          ownershipStatus: "VACANT",
          updatedAt: new Date(),
        })
        .where(eq(flats.id, flatId));
    }

    if (operatorId) {
      await db.insert(auditLogs).values({
        userId: operatorId,
        action: "MOVE_OUT_RESIDENT",
        module: "RESIDENTS",
        recordId: id,
        newData: JSON.stringify({ flatId, moveOutDate, reason: moveOutData.reason }),
      });
    }

    return { success: true, message: `Resident ${residentRecord.fullName} moved out successfully.` };
  }

  static async deleteResident(id: number) {
    const existing = await db.select().from(residents).where(eq(residents.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Resident not found");
    }
    const flatId = existing[0].flatId;
    await db.update(residents).set({
      status: "INACTIVE",
      moveOutDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date(),
    }).where(eq(residents.id, id));

    const otherActive = await db
      .select()
      .from(residents)
      .where(and(eq(residents.flatId, flatId), eq(residents.status, "ACTIVE")))
      .limit(1);

    if (otherActive.length === 0) {
      await db.update(flats).set({ occupancyStatus: "VACANT", updatedAt: new Date() }).where(eq(flats.id, flatId));
    }

    return { success: true, message: "Resident deactivated/removed successfully" };
  }

  // -------------------------------------------------------------
  // FAMILY MEMBERS
  // -------------------------------------------------------------
  static async getFamilyMembers(residentId?: number, flatId?: number) {
    if (residentId) {
      return db
        .select()
        .from(familyMembers)
        .where(and(eq(familyMembers.residentId, residentId), eq(familyMembers.status, "ACTIVE")));
    }
    if (flatId) {
      const flatRes = await db
        .select({ id: residents.id })
        .from(residents)
        .where(and(eq(residents.flatId, flatId), eq(residents.status, "ACTIVE")));
      const resIds = flatRes.map((r) => r.id);
      if (resIds.length === 0) return [];
      const allFM = await db.select().from(familyMembers).where(eq(familyMembers.status, "ACTIVE"));
      return allFM.filter((fm) => resIds.includes(fm.residentId));
    }
    return db.select().from(familyMembers).where(eq(familyMembers.status, "ACTIVE"));
  }

  static async addFamilyMember(data: any) {
    const res = await db.insert(familyMembers).values({
      residentId: data.residentId,
      name: data.name.trim(),
      relationship: data.relationship.trim(),
      age: data.age || null,
      mobile: data.mobile ? data.mobile.trim() : null,
      status: "ACTIVE",
    });
    return { id: res[0].insertId, ...data };
  }

  static async updateFamilyMember(id: number, data: any) {
    await db.update(familyMembers).set({ ...data, updatedAt: new Date() }).where(eq(familyMembers.id, id));
    const updated = await db.select().from(familyMembers).where(eq(familyMembers.id, id)).limit(1);
    return updated[0];
  }

  static async deleteFamilyMember(id: number) {
    await db.update(familyMembers).set({ status: "INACTIVE" }).where(eq(familyMembers.id, id));
    return { success: true, message: "Family member removed" };
  }

  // -------------------------------------------------------------
  // VEHICLES
  // -------------------------------------------------------------
  static async getVehicles(flatId?: number, residentId?: number) {
    let conditions: any[] = [eq(vehicles.status, "ACTIVE")];
    if (flatId) conditions.push(eq(vehicles.flatId, flatId));
    if (residentId) conditions.push(eq(vehicles.residentId, residentId));

    return db
      .select({
        id: vehicles.id,
        flatId: vehicles.flatId,
        flatNumber: flats.flatNumber,
        residentId: vehicles.residentId,
        residentName: residents.fullName,
        vehicleType: vehicles.vehicleType,
        vehicleNumber: vehicles.vehicleNumber,
        brand: vehicles.brand,
        model: vehicles.model,
        parkingSlot: vehicles.parkingSlot,
        status: vehicles.status,
        createdAt: vehicles.createdAt,
      })
      .from(vehicles)
      .leftJoin(flats, eq(vehicles.flatId, flats.id))
      .leftJoin(residents, eq(vehicles.residentId, residents.id))
      .where(and(...conditions))
      .orderBy(vehicles.vehicleNumber);
  }

  static async addVehicle(data: any) {
    let flatId = data.flatId;
    if (!flatId && data.residentId) {
      const resRecord = await db.select({ flatId: residents.flatId }).from(residents).where(eq(residents.id, data.residentId)).limit(1);
      if (resRecord.length > 0) flatId = resRecord[0].flatId;
    }

    const slot = data.parkingSlot || data.slotNumber;
    const res = await db.insert(vehicles).values({
      residentId: data.residentId || null,
      flatId: flatId || 1,
      vehicleType: data.vehicleType || "CAR",
      vehicleNumber: data.vehicleNumber.trim().toUpperCase(),
      brand: data.brand ? data.brand.trim() : null,
      model: data.model ? data.model.trim() : null,
      parkingSlot: slot ? slot.trim().toUpperCase() : null,
      status: "ACTIVE",
    });
    return { id: res[0].insertId, ...data };
  }

  static async updateVehicle(id: number, data: any) {
    await db.update(vehicles).set({ ...data, updatedAt: new Date() }).where(eq(vehicles.id, id));
    const updated = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return updated[0];
  }

  static async deleteVehicle(id: number) {
    await db.update(vehicles).set({ status: "INACTIVE" }).where(eq(vehicles.id, id));
    return { success: true, message: "Vehicle removed" };
  }
}
