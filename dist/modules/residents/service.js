"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResidentService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
const hash_js_1 = require("../../utils/hash.js");
class ResidentService {
    /**
     * List all residents with Flat details
     */
    static async getAllResidents(filters) {
        let conditions = [];
        if (filters?.flatId) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.residents.flatId, filters.flatId));
        }
        if (filters?.residentType && filters.residentType !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.residents.residentType, filters.residentType));
        }
        if (filters?.status && filters.status !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.residents.status, filters.status));
        }
        else {
            // Default to active unless explicitly asking for ALL or INACTIVE
            if (!filters?.status) {
                conditions.push((0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE"));
            }
        }
        const list = await index_js_1.db
            .select({
            id: index_js_2.residents.id,
            userId: index_js_2.residents.userId,
            flatId: index_js_2.residents.flatId,
            residentType: index_js_2.residents.residentType,
            fullName: index_js_2.residents.fullName,
            mobile: index_js_2.residents.mobile,
            email: index_js_2.residents.email,
            gender: index_js_2.residents.gender,
            dateOfBirth: index_js_2.residents.dateOfBirth,
            idProofType: index_js_2.residents.idProofType,
            idProofNumber: index_js_2.residents.idProofNumber,
            moveInDate: index_js_2.residents.moveInDate,
            moveOutDate: index_js_2.residents.moveOutDate,
            status: index_js_2.residents.status,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            blockName: index_js_2.blocks.name,
            floorNumber: index_js_2.floors.floorNumber,
            monthlyMaintenance: index_js_2.flats.monthlyMaintenance,
            createdAt: index_js_2.residents.createdAt,
        })
            .from(index_js_2.residents)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.residents.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.floors, (0, drizzle_orm_1.eq)(index_js_2.flats.floorId, index_js_2.floors.id))
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.residents.moveInDate));
        let filtered = list;
        if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            filtered = filtered.filter((r) => r.fullName.toLowerCase().includes(q) ||
                r.mobile.includes(q) ||
                (r.email && r.email.toLowerCase().includes(q)) ||
                (r.flatNumber && r.flatNumber.toLowerCase().includes(q)) ||
                (r.blockName && r.blockName.toLowerCase().includes(q)));
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
    static async getResidentById(id) {
        const list = await index_js_1.db
            .select({
            id: index_js_2.residents.id,
            userId: index_js_2.residents.userId,
            flatId: index_js_2.residents.flatId,
            residentType: index_js_2.residents.residentType,
            fullName: index_js_2.residents.fullName,
            mobile: index_js_2.residents.mobile,
            email: index_js_2.residents.email,
            gender: index_js_2.residents.gender,
            dateOfBirth: index_js_2.residents.dateOfBirth,
            idProofType: index_js_2.residents.idProofType,
            idProofNumber: index_js_2.residents.idProofNumber,
            moveInDate: index_js_2.residents.moveInDate,
            moveOutDate: index_js_2.residents.moveOutDate,
            status: index_js_2.residents.status,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            blockName: index_js_2.blocks.name,
            floorNumber: index_js_2.floors.floorNumber,
            monthlyMaintenance: index_js_2.flats.monthlyMaintenance,
            createdAt: index_js_2.residents.createdAt,
        })
            .from(index_js_2.residents)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.residents.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.floors, (0, drizzle_orm_1.eq)(index_js_2.flats.floorId, index_js_2.floors.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.residents.id, id))
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
        const fmList = await index_js_1.db
            .select()
            .from(index_js_2.familyMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.familyMembers.residentId, id), (0, drizzle_orm_1.eq)(index_js_2.familyMembers.status, "ACTIVE")));
        // Vehicles
        const vhList = await index_js_1.db
            .select()
            .from(index_js_2.vehicles)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.vehicles.residentId, id), (0, drizzle_orm_1.eq)(index_js_2.vehicles.flatId, resident.flatId)), (0, drizzle_orm_1.eq)(index_js_2.vehicles.status, "ACTIVE")));
        // Maintenance Bills
        const bills = await index_js_1.db
            .select()
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.flatId, resident.flatId))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.maintenanceBills.billingYear), (0, drizzle_orm_1.desc)(index_js_2.maintenanceBills.billingMonth));
        // Payments
        const payList = await index_js_1.db
            .select()
            .from(index_js_2.payments)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.payments.residentId, id), (0, drizzle_orm_1.eq)(index_js_2.payments.flatId, resident.flatId)))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.payments.paymentDate));
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
    static async addResident(data, operatorId) {
        const rawMobile = String(data.mobile || data.phone || "");
        const cleanMobile = rawMobile.trim();
        const rawName = String(data.fullName || data.name || "");
        const cleanName = rawName.trim();
        const cleanEmail = data.email && data.email.trim() ? data.email.trim() : `${cleanMobile}@greengarden.local`;
        // 1. Check or create user in users table
        let userId = data.userId;
        if (!userId) {
            const existingUser = await index_js_1.db
                .select()
                .from(index_js_2.users)
                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.users.mobile, cleanMobile), (0, drizzle_orm_1.eq)(index_js_2.users.email, cleanEmail)))
                .limit(1);
            if (existingUser.length > 0) {
                userId = existingUser[0].id;
            }
            else {
                const hashedPassword = await (0, hash_js_1.hashPassword)(data.password || "User@123");
                const userRes = await index_js_1.db.insert(index_js_2.users).values({
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
        const res = await index_js_1.db.insert(index_js_2.residents).values({
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
        await index_js_1.db
            .update(index_js_2.flats)
            .set({
            occupancyStatus: "OCCUPIED",
            ownershipStatus,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(index_js_2.flats.id, data.flatId));
        // Audit log
        if (operatorId) {
            await index_js_1.db.insert(index_js_2.auditLogs).values({
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
    static async updateResident(id, data, operatorId) {
        const existing = await index_js_1.db.select().from(index_js_2.residents).where((0, drizzle_orm_1.eq)(index_js_2.residents.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Resident not found");
        }
        const payload = { ...data, updatedAt: new Date() };
        const rawName = data.fullName || data.name;
        if (rawName)
            payload.fullName = String(rawName).trim();
        const rawMobile = data.mobile || data.phone;
        if (rawMobile)
            payload.mobile = String(rawMobile).trim();
        if (data.email)
            payload.email = data.email.trim();
        delete payload.name;
        delete payload.phone;
        delete payload.emergencyContactName;
        delete payload.emergencyContactPhone;
        await index_js_1.db.update(index_js_2.residents).set(payload).where((0, drizzle_orm_1.eq)(index_js_2.residents.id, id));
        // Also update users table name/mobile
        if (existing[0].userId) {
            await index_js_1.db.update(index_js_2.users).set({
                name: payload.fullName || existing[0].fullName,
                mobile: payload.mobile || existing[0].mobile,
                email: payload.email || undefined,
                updatedAt: new Date(),
            }).where((0, drizzle_orm_1.eq)(index_js_2.users.id, existing[0].userId));
        }
        return this.getResidentById(id);
    }
    /**
     * Move Out Resident
     * Records historical move out date and updates flat occupancy status
     */
    static async moveOutResident(id, moveOutData, operatorId) {
        const existing = await index_js_1.db.select().from(index_js_2.residents).where((0, drizzle_orm_1.eq)(index_js_2.residents.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Resident not found");
        }
        const residentRecord = existing[0];
        const flatId = residentRecord.flatId;
        const moveOutDate = moveOutData.moveOutDate || new Date().toISOString().slice(0, 10);
        // 1. Mark resident as INACTIVE with move_out_date
        await index_js_1.db
            .update(index_js_2.residents)
            .set({
            status: "INACTIVE",
            moveOutDate,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(index_js_2.residents.id, id));
        // 2. Check if any other ACTIVE residents remain in this flat
        const remainingActive = await index_js_1.db
            .select()
            .from(index_js_2.residents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.residents.flatId, flatId), (0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE")));
        if (remainingActive.length === 0) {
            // Set flat to VACANT
            await index_js_1.db
                .update(index_js_2.flats)
                .set({
                occupancyStatus: "VACANT",
                ownershipStatus: "VACANT",
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(index_js_2.flats.id, flatId));
        }
        if (operatorId) {
            await index_js_1.db.insert(index_js_2.auditLogs).values({
                userId: operatorId,
                action: "MOVE_OUT_RESIDENT",
                module: "RESIDENTS",
                recordId: id,
                newData: JSON.stringify({ flatId, moveOutDate, reason: moveOutData.reason }),
            });
        }
        return { success: true, message: `Resident ${residentRecord.fullName} moved out successfully.` };
    }
    static async deleteResident(id) {
        const existing = await index_js_1.db.select().from(index_js_2.residents).where((0, drizzle_orm_1.eq)(index_js_2.residents.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Resident not found");
        }
        const flatId = existing[0].flatId;
        await index_js_1.db.update(index_js_2.residents).set({
            status: "INACTIVE",
            moveOutDate: new Date().toISOString().slice(0, 10),
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(index_js_2.residents.id, id));
        const otherActive = await index_js_1.db
            .select()
            .from(index_js_2.residents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.residents.flatId, flatId), (0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE")))
            .limit(1);
        if (otherActive.length === 0) {
            await index_js_1.db.update(index_js_2.flats).set({ occupancyStatus: "VACANT", updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_2.flats.id, flatId));
        }
        return { success: true, message: "Resident deactivated/removed successfully" };
    }
    // -------------------------------------------------------------
    // FAMILY MEMBERS
    // -------------------------------------------------------------
    static async getFamilyMembers(residentId, flatId) {
        if (residentId) {
            return index_js_1.db
                .select()
                .from(index_js_2.familyMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.familyMembers.residentId, residentId), (0, drizzle_orm_1.eq)(index_js_2.familyMembers.status, "ACTIVE")));
        }
        if (flatId) {
            const flatRes = await index_js_1.db
                .select({ id: index_js_2.residents.id })
                .from(index_js_2.residents)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.residents.flatId, flatId), (0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE")));
            const resIds = flatRes.map((r) => r.id);
            if (resIds.length === 0)
                return [];
            const allFM = await index_js_1.db.select().from(index_js_2.familyMembers).where((0, drizzle_orm_1.eq)(index_js_2.familyMembers.status, "ACTIVE"));
            return allFM.filter((fm) => resIds.includes(fm.residentId));
        }
        return index_js_1.db.select().from(index_js_2.familyMembers).where((0, drizzle_orm_1.eq)(index_js_2.familyMembers.status, "ACTIVE"));
    }
    static async addFamilyMember(data) {
        const res = await index_js_1.db.insert(index_js_2.familyMembers).values({
            residentId: data.residentId,
            name: data.name.trim(),
            relationship: data.relationship.trim(),
            age: data.age || null,
            mobile: data.mobile ? data.mobile.trim() : null,
            status: "ACTIVE",
        });
        return { id: res[0].insertId, ...data };
    }
    static async updateFamilyMember(id, data) {
        await index_js_1.db.update(index_js_2.familyMembers).set({ ...data, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_2.familyMembers.id, id));
        const updated = await index_js_1.db.select().from(index_js_2.familyMembers).where((0, drizzle_orm_1.eq)(index_js_2.familyMembers.id, id)).limit(1);
        return updated[0];
    }
    static async deleteFamilyMember(id) {
        await index_js_1.db.update(index_js_2.familyMembers).set({ status: "INACTIVE" }).where((0, drizzle_orm_1.eq)(index_js_2.familyMembers.id, id));
        return { success: true, message: "Family member removed" };
    }
    // -------------------------------------------------------------
    // VEHICLES
    // -------------------------------------------------------------
    static async getVehicles(flatId, residentId) {
        let conditions = [(0, drizzle_orm_1.eq)(index_js_2.vehicles.status, "ACTIVE")];
        if (flatId)
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.vehicles.flatId, flatId));
        if (residentId)
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.vehicles.residentId, residentId));
        return index_js_1.db
            .select({
            id: index_js_2.vehicles.id,
            flatId: index_js_2.vehicles.flatId,
            flatNumber: index_js_2.flats.flatNumber,
            residentId: index_js_2.vehicles.residentId,
            residentName: index_js_2.residents.fullName,
            vehicleType: index_js_2.vehicles.vehicleType,
            vehicleNumber: index_js_2.vehicles.vehicleNumber,
            brand: index_js_2.vehicles.brand,
            model: index_js_2.vehicles.model,
            parkingSlot: index_js_2.vehicles.parkingSlot,
            status: index_js_2.vehicles.status,
            createdAt: index_js_2.vehicles.createdAt,
        })
            .from(index_js_2.vehicles)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.vehicles.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.residents, (0, drizzle_orm_1.eq)(index_js_2.vehicles.residentId, index_js_2.residents.id))
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(index_js_2.vehicles.vehicleNumber);
    }
    static async addVehicle(data) {
        let flatId = data.flatId;
        if (!flatId && data.residentId) {
            const resRecord = await index_js_1.db.select({ flatId: index_js_2.residents.flatId }).from(index_js_2.residents).where((0, drizzle_orm_1.eq)(index_js_2.residents.id, data.residentId)).limit(1);
            if (resRecord.length > 0)
                flatId = resRecord[0].flatId;
        }
        const slot = data.parkingSlot || data.slotNumber;
        const res = await index_js_1.db.insert(index_js_2.vehicles).values({
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
    static async updateVehicle(id, data) {
        await index_js_1.db.update(index_js_2.vehicles).set({ ...data, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_2.vehicles.id, id));
        const updated = await index_js_1.db.select().from(index_js_2.vehicles).where((0, drizzle_orm_1.eq)(index_js_2.vehicles.id, id)).limit(1);
        return updated[0];
    }
    static async deleteVehicle(id) {
        await index_js_1.db.update(index_js_2.vehicles).set({ status: "INACTIVE" }).where((0, drizzle_orm_1.eq)(index_js_2.vehicles.id, id));
        return { success: true, message: "Vehicle removed" };
    }
}
exports.ResidentService = ResidentService;
