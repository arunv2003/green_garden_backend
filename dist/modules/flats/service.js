"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class FlatService {
    /**
     * List all flats with Block & Floor info, current occupants, and pending maintenance summary
     */
    static async getAllFlats(filters) {
        let conditions = [(0, drizzle_orm_1.eq)(index_js_2.flats.status, "ACTIVE")];
        if (filters?.blockId) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.flats.blockId, filters.blockId));
        }
        if (filters?.floorId) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.flats.floorId, filters.floorId));
        }
        if (filters?.occupancyStatus && filters.occupancyStatus !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.flats.occupancyStatus, filters.occupancyStatus));
        }
        const flatList = await index_js_1.db
            .select({
            id: index_js_2.flats.id,
            societyId: index_js_2.flats.societyId,
            blockId: index_js_2.flats.blockId,
            blockName: index_js_2.blocks.name,
            blockCode: index_js_2.blocks.code,
            floorId: index_js_2.flats.floorId,
            floorNumber: index_js_2.floors.floorNumber,
            floorName: index_js_2.floors.name,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            areaSqft: index_js_2.flats.areaSqft,
            bedrooms: index_js_2.flats.bedrooms,
            bathrooms: index_js_2.flats.bathrooms,
            occupancyStatus: index_js_2.flats.occupancyStatus,
            ownershipStatus: index_js_2.flats.ownershipStatus,
            monthlyMaintenance: index_js_2.flats.monthlyMaintenance,
            status: index_js_2.flats.status,
            createdAt: index_js_2.flats.createdAt,
            updatedAt: index_js_2.flats.updatedAt,
        })
            .from(index_js_2.flats)
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.floors, (0, drizzle_orm_1.eq)(index_js_2.flats.floorId, index_js_2.floors.id))
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(index_js_2.flats.flatNumber);
        // Fetch active residents for these flats
        const activeResidents = await index_js_1.db
            .select()
            .from(index_js_2.residents)
            .where((0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE"));
        // Fetch pending maintenance amounts per flat
        const pendingSums = await index_js_1.db
            .select({
            flatId: index_js_2.maintenanceBills.flatId,
            totalPending: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.pendingAmount}), 0)`,
        })
            .from(index_js_2.maintenanceBills)
            .groupBy(index_js_2.maintenanceBills.flatId);
        const pendingMap = new Map();
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
            enriched = enriched.filter((f) => f.flatNumber.toLowerCase().includes(q) ||
                f.blockName?.toLowerCase().includes(q) ||
                f.flatType.toLowerCase().includes(q) ||
                (f.currentResident?.fullName && f.currentResident.fullName.toLowerCase().includes(q)) ||
                (f.currentOwner?.fullName && f.currentOwner.fullName.toLowerCase().includes(q)) ||
                (f.currentTenant?.fullName && f.currentTenant.fullName.toLowerCase().includes(q)));
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
    static async getFlatDetails(idOrNumber) {
        let condition = typeof idOrNumber === "number" || !isNaN(Number(idOrNumber))
            ? (0, drizzle_orm_1.eq)(index_js_2.flats.id, Number(idOrNumber))
            : (0, drizzle_orm_1.eq)(index_js_2.flats.flatNumber, String(idOrNumber).trim());
        const flatRecords = await index_js_1.db
            .select({
            id: index_js_2.flats.id,
            societyId: index_js_2.flats.societyId,
            blockId: index_js_2.flats.blockId,
            blockName: index_js_2.blocks.name,
            blockCode: index_js_2.blocks.code,
            floorId: index_js_2.flats.floorId,
            floorNumber: index_js_2.floors.floorNumber,
            floorName: index_js_2.floors.name,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            areaSqft: index_js_2.flats.areaSqft,
            bedrooms: index_js_2.flats.bedrooms,
            bathrooms: index_js_2.flats.bathrooms,
            occupancyStatus: index_js_2.flats.occupancyStatus,
            ownershipStatus: index_js_2.flats.ownershipStatus,
            monthlyMaintenance: index_js_2.flats.monthlyMaintenance,
            status: index_js_2.flats.status,
            createdAt: index_js_2.flats.createdAt,
            updatedAt: index_js_2.flats.updatedAt,
        })
            .from(index_js_2.flats)
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.floors, (0, drizzle_orm_1.eq)(index_js_2.flats.floorId, index_js_2.floors.id))
            .where(condition)
            .limit(1);
        if (flatRecords.length === 0) {
            throw new Error(`Flat '${idOrNumber}' not found`);
        }
        const flat = flatRecords[0];
        const flatId = flat.id;
        // 1. All residents for this flat (active and historical)
        const allResidents = await index_js_1.db
            .select()
            .from(index_js_2.residents)
            .where((0, drizzle_orm_1.eq)(index_js_2.residents.flatId, flatId))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.residents.moveInDate));
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
        let currentFamilyMembers = [];
        if (activeResidentIds.length > 0) {
            const allFM = await index_js_1.db.select().from(index_js_2.familyMembers).where((0, drizzle_orm_1.eq)(index_js_2.familyMembers.status, "ACTIVE"));
            currentFamilyMembers = allFM.filter((fm) => activeResidentIds.includes(fm.residentId));
        }
        // 3. Vehicles registered for this flat
        const flatVehicles = await index_js_1.db
            .select()
            .from(index_js_2.vehicles)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.vehicles.flatId, flatId), (0, drizzle_orm_1.eq)(index_js_2.vehicles.status, "ACTIVE")));
        // 4. Maintenance Bills for this flat
        const bills = await index_js_1.db
            .select()
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.flatId, flatId))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.maintenanceBills.billingYear), (0, drizzle_orm_1.desc)(index_js_2.maintenanceBills.billingMonth));
        const totalBilled = bills.reduce((acc, b) => acc + parseFloat(b.totalAmount), 0);
        const totalPaid = bills.reduce((acc, b) => acc + parseFloat(b.paidAmount), 0);
        const totalPending = bills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
        // Current latest bill
        const currentBill = bills[0] || null;
        // 5. Payment History
        const paymentHistory = await index_js_1.db
            .select()
            .from(index_js_2.payments)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.payments.flatId, flatId), (0, drizzle_orm_1.eq)(index_js_2.payments.roomId, flatId)))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.payments.paymentDate));
        // 6. Visitor History for this flat
        const visitorHistory = await index_js_1.db
            .select()
            .from(index_js_2.visitors)
            .where((0, drizzle_orm_1.eq)(index_js_2.visitors.flatId, flatId))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.visitors.entryDate), (0, drizzle_orm_1.desc)(index_js_2.visitors.entryTime));
        // 7. Complaints for this flat
        const flatComplaints = await index_js_1.db
            .select()
            .from(index_js_2.complaints)
            .where((0, drizzle_orm_1.eq)(index_js_2.complaints.flatId, flatId))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.complaints.createdAt));
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
    static async createFlat(data) {
        const existing = await index_js_1.db
            .select()
            .from(index_js_2.flats)
            .where((0, drizzle_orm_1.eq)(index_js_2.flats.flatNumber, data.flatNumber.trim()))
            .limit(1);
        if (existing.length > 0) {
            throw new Error(`Flat number '${data.flatNumber}' already exists.`);
        }
        const res = await index_js_1.db.insert(index_js_2.flats).values({
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
    static async updateFlat(id, data) {
        const existing = await index_js_1.db.select().from(index_js_2.flats).where((0, drizzle_orm_1.eq)(index_js_2.flats.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Flat not found");
        }
        if (data.flatNumber && data.flatNumber.trim() !== existing[0].flatNumber) {
            const conflict = await index_js_1.db
                .select()
                .from(index_js_2.flats)
                .where((0, drizzle_orm_1.eq)(index_js_2.flats.flatNumber, data.flatNumber.trim()))
                .limit(1);
            if (conflict.length > 0) {
                throw new Error(`Flat number '${data.flatNumber}' is already in use.`);
            }
        }
        await index_js_1.db.update(index_js_2.flats).set({ ...data, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_2.flats.id, id));
        return this.getFlatDetails(id);
    }
    static async deleteFlat(id) {
        // Check if flat has active residents
        const activeRes = await index_js_1.db
            .select()
            .from(index_js_2.residents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.residents.flatId, id), (0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE")))
            .limit(1);
        if (activeRes.length > 0) {
            throw new Error("Cannot deactivate flat with active residents. Please move out residents first.");
        }
        await index_js_1.db.update(index_js_2.flats).set({ status: "INACTIVE", updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_2.flats.id, id));
        return { success: true, message: "Flat deactivated successfully" };
    }
}
exports.FlatService = FlatService;
