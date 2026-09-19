"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../config/index.js");
const index_js_3 = require("../../db/schema/index.js");
class MaintenanceService {
    /**
     * List all maintenance bills with Flat & Resident details
     */
    static async getAllBills(filters) {
        let conditions = [];
        if (filters?.flatId)
            conditions.push((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.flatId, filters.flatId));
        if (filters?.residentId)
            conditions.push((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.residentId, filters.residentId));
        if (filters?.billingMonth)
            conditions.push((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.billingMonth, filters.billingMonth));
        if (filters?.billingYear)
            conditions.push((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.billingYear, filters.billingYear));
        if (filters?.status && filters.status !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.status, filters.status));
        }
        const list = await index_js_1.db
            .select({
            id: index_js_3.maintenanceBills.id,
            societyId: index_js_3.maintenanceBills.societyId,
            flatId: index_js_3.maintenanceBills.flatId,
            residentId: index_js_3.maintenanceBills.residentId,
            billingMonth: index_js_3.maintenanceBills.billingMonth,
            billingYear: index_js_3.maintenanceBills.billingYear,
            baseAmount: index_js_3.maintenanceBills.baseAmount,
            additionalCharges: index_js_3.maintenanceBills.additionalCharges,
            lateFee: index_js_3.maintenanceBills.lateFee,
            discount: index_js_3.maintenanceBills.discount,
            totalAmount: index_js_3.maintenanceBills.totalAmount,
            paidAmount: index_js_3.maintenanceBills.paidAmount,
            pendingAmount: index_js_3.maintenanceBills.pendingAmount,
            dueDate: index_js_3.maintenanceBills.dueDate,
            status: index_js_3.maintenanceBills.status,
            remarks: index_js_3.maintenanceBills.remarks,
            flatNumber: index_js_3.flats.flatNumber,
            flatType: index_js_3.flats.flatType,
            blockName: index_js_3.blocks.name,
            floorNumber: index_js_3.floors.floorNumber,
            residentName: index_js_3.residents.fullName,
            residentMobile: index_js_3.residents.mobile,
            createdAt: index_js_3.maintenanceBills.createdAt,
        })
            .from(index_js_3.maintenanceBills)
            .leftJoin(index_js_3.flats, (0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.flatId, index_js_3.flats.id))
            .leftJoin(index_js_3.blocks, (0, drizzle_orm_1.eq)(index_js_3.flats.blockId, index_js_3.blocks.id))
            .leftJoin(index_js_3.floors, (0, drizzle_orm_1.eq)(index_js_3.flats.floorId, index_js_3.floors.id))
            .leftJoin(index_js_3.residents, (0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.residentId, index_js_3.residents.id))
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .orderBy((0, drizzle_orm_1.desc)(index_js_3.maintenanceBills.billingYear), (0, drizzle_orm_1.desc)(index_js_3.maintenanceBills.billingMonth), index_js_3.flats.flatNumber);
        // Fetch all residents and all bills for accurate resident resolution and previous dues
        const allResidents = await index_js_1.db.select().from(index_js_3.residents);
        const allFlatBills = await index_js_1.db
            .select({
            id: index_js_3.maintenanceBills.id,
            flatId: index_js_3.maintenanceBills.flatId,
            billingMonth: index_js_3.maintenanceBills.billingMonth,
            billingYear: index_js_3.maintenanceBills.billingYear,
            pendingAmount: index_js_3.maintenanceBills.pendingAmount,
        })
            .from(index_js_3.maintenanceBills);
        const enriched = list.map((b) => {
            const monthStart = new Date(b.billingYear, b.billingMonth - 1, 1);
            const monthEnd = new Date(b.billingYear, b.billingMonth, 0, 23, 59, 59, 999);
            let resident = null;
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
                    allResidents.find((r) => r.flatId === b.flatId &&
                        new Date(r.moveInDate) <= monthEnd &&
                        (!r.moveOutDate || new Date(r.moveOutDate) >= monthStart)) || null;
            }
            if (!resident) {
                resident = allResidents.find((r) => r.flatId === b.flatId && r.status === "ACTIVE") || null;
            }
            const prevDues = allFlatBills
                .filter((ob) => ob.flatId === b.flatId &&
                (ob.billingYear < b.billingYear ||
                    (ob.billingYear === b.billingYear && ob.billingMonth < b.billingMonth)))
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
            filtered = filtered.filter((b) => b.flatNumber?.toLowerCase().includes(q) ||
                b.residentName?.toLowerCase().includes(q) ||
                b.residentPhone?.includes(q) ||
                b.residentMobile?.includes(q) ||
                b.blockName?.toLowerCase().includes(q));
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
    static async getBillById(id) {
        const list = await index_js_1.db
            .select({
            id: index_js_3.maintenanceBills.id,
            societyId: index_js_3.maintenanceBills.societyId,
            flatId: index_js_3.maintenanceBills.flatId,
            residentId: index_js_3.maintenanceBills.residentId,
            billingMonth: index_js_3.maintenanceBills.billingMonth,
            billingYear: index_js_3.maintenanceBills.billingYear,
            baseAmount: index_js_3.maintenanceBills.baseAmount,
            additionalCharges: index_js_3.maintenanceBills.additionalCharges,
            lateFee: index_js_3.maintenanceBills.lateFee,
            discount: index_js_3.maintenanceBills.discount,
            totalAmount: index_js_3.maintenanceBills.totalAmount,
            paidAmount: index_js_3.maintenanceBills.paidAmount,
            pendingAmount: index_js_3.maintenanceBills.pendingAmount,
            dueDate: index_js_3.maintenanceBills.dueDate,
            status: index_js_3.maintenanceBills.status,
            remarks: index_js_3.maintenanceBills.remarks,
            flatNumber: index_js_3.flats.flatNumber,
            flatType: index_js_3.flats.flatType,
            blockName: index_js_3.blocks.name,
            floorNumber: index_js_3.floors.floorNumber,
            residentName: index_js_3.residents.fullName,
            residentMobile: index_js_3.residents.mobile,
            createdAt: index_js_3.maintenanceBills.createdAt,
        })
            .from(index_js_3.maintenanceBills)
            .leftJoin(index_js_3.flats, (0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.flatId, index_js_3.flats.id))
            .leftJoin(index_js_3.blocks, (0, drizzle_orm_1.eq)(index_js_3.flats.blockId, index_js_3.blocks.id))
            .leftJoin(index_js_3.floors, (0, drizzle_orm_1.eq)(index_js_3.flats.floorId, index_js_3.floors.id))
            .leftJoin(index_js_3.residents, (0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.residentId, index_js_3.residents.id))
            .where((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.id, id))
            .limit(1);
        if (list.length === 0) {
            throw new Error("Maintenance bill not found");
        }
        const bill = list[0];
        const allResidents = await index_js_1.db.select().from(index_js_3.residents);
        const monthStart = new Date(bill.billingYear, bill.billingMonth - 1, 1);
        const monthEnd = new Date(bill.billingYear, bill.billingMonth, 0, 23, 59, 59, 999);
        let resident = null;
        if (bill.residentId) {
            const directRes = allResidents.find((r) => r.id === bill.residentId);
            if (directRes && !(directRes.moveOutDate && new Date(directRes.moveOutDate) < monthStart)) {
                resident = directRes;
            }
        }
        if (!resident) {
            resident =
                allResidents.find((r) => r.flatId === bill.flatId &&
                    new Date(r.moveInDate) <= monthEnd &&
                    (!r.moveOutDate || new Date(r.moveOutDate) >= monthStart)) || allResidents.find((r) => r.flatId === bill.flatId && r.status === "ACTIVE") || null;
        }
        const allFlatBills = await index_js_1.db
            .select({
            id: index_js_3.maintenanceBills.id,
            flatId: index_js_3.maintenanceBills.flatId,
            billingMonth: index_js_3.maintenanceBills.billingMonth,
            billingYear: index_js_3.maintenanceBills.billingYear,
            pendingAmount: index_js_3.maintenanceBills.pendingAmount,
        })
            .from(index_js_3.maintenanceBills)
            .where((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.flatId, bill.flatId));
        const prevDues = allFlatBills
            .filter((ob) => ob.billingYear < bill.billingYear ||
            (ob.billingYear === bill.billingYear && ob.billingMonth < bill.billingMonth))
            .reduce((sum, ob) => sum + parseFloat(ob.pendingAmount || "0"), 0);
        // Payments for this bill
        const billPayments = await index_js_1.db
            .select()
            .from(index_js_3.payments)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_3.payments.maintenanceBillId, id), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_3.payments.flatId, bill.flatId), (0, drizzle_orm_1.eq)(index_js_3.payments.billingMonth, bill.billingMonth), (0, drizzle_orm_1.eq)(index_js_3.payments.billingYear, bill.billingYear))))
            .orderBy((0, drizzle_orm_1.desc)(index_js_3.payments.paymentDate));
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
    static async generateMonthlyBills(data, operatorId) {
        const { billingMonth, billingYear, dueDate, additionalCharges = 0, remarks } = data;
        // 1. Fetch all ACTIVE flats
        const allFlats = await index_js_1.db
            .select()
            .from(index_js_3.flats)
            .where((0, drizzle_orm_1.eq)(index_js_3.flats.status, "ACTIVE"));
        // 2. Fetch active residents mapped to flats
        const activeResidents = await index_js_1.db
            .select()
            .from(index_js_3.residents)
            .where((0, drizzle_orm_1.eq)(index_js_3.residents.status, "ACTIVE"));
        // 3. Fetch existing bills for this month/year to prevent duplicates
        const existingBills = await index_js_1.db
            .select({ flatId: index_js_3.maintenanceBills.flatId })
            .from(index_js_3.maintenanceBills)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.billingMonth, billingMonth), (0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.billingYear, billingYear)));
        const existingFlatIds = new Set(existingBills.map((b) => b.flatId));
        let generatedCount = 0;
        let skippedCount = 0;
        const generatedBills = [];
        const daysInMonth = new Date(billingYear, billingMonth, 0).getDate();
        const monthStart = new Date(billingYear, billingMonth - 1, 1);
        const monthEnd = new Date(billingYear, billingMonth, 0, 23, 59, 59, 999);
        for (const flat of allFlats) {
            if (existingFlatIds.has(flat.id)) {
                skippedCount++;
                continue;
            }
            const resident = activeResidents.find((r) => r.flatId === flat.id &&
                new Date(r.moveInDate) <= monthEnd &&
                (!r.moveOutDate || new Date(r.moveOutDate) >= monthStart)) || activeResidents.find((r) => r.flatId === flat.id);
            const monthlyMaintenance = parseFloat(flat.monthlyMaintenance);
            let baseAmount = monthlyMaintenance;
            let billRemarks = remarks || `Maintenance bill for ${billingMonth}/${billingYear}`;
            if (index_js_2.config.billingMode === "DAILY_PRORATED" && resident) {
                const moveInDate = new Date(resident.moveInDate);
                const inYear = moveInDate.getFullYear();
                const inMonth = moveInDate.getMonth() + 1;
                const inDay = moveInDate.getDate();
                if (inYear === billingYear && inMonth === billingMonth && inDay > 1) {
                    const proratedDays = daysInMonth - inDay + 1;
                    baseAmount = Math.round((monthlyMaintenance / daysInMonth) * proratedDays);
                    billRemarks = `Prorated ${proratedDays} days from move-in (${inDay}/${billingMonth}/${billingYear})`;
                }
                else if (resident.moveOutDate) {
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
            }
            else if (!resident) {
                billRemarks = `Vacant flat maintenance for ${billingMonth}/${billingYear}`;
            }
            const totalAmount = baseAmount + additionalCharges;
            const res = await index_js_1.db.insert(index_js_3.maintenanceBills).values({
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
            await index_js_1.db.insert(index_js_3.auditLogs).values({
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
    static async createBill(data, operatorId) {
        // Check duplicate
        const existing = await index_js_1.db
            .select()
            .from(index_js_3.maintenanceBills)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.flatId, data.flatId), (0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.billingMonth, data.billingMonth), (0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.billingYear, data.billingYear)))
            .limit(1);
        if (existing.length > 0) {
            throw new Error(`A maintenance bill for Flat ID ${data.flatId} for ${data.billingMonth}/${data.billingYear} already exists.`);
        }
        const baseAmount = data.baseAmount;
        const addCharges = data.additionalCharges || 0;
        const lateFee = data.lateFee || 0;
        const discount = data.discount || 0;
        const totalAmount = baseAmount + addCharges + lateFee - discount;
        const res = await index_js_1.db.insert(index_js_3.maintenanceBills).values({
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
    static async updateBill(id, data) {
        const existing = await index_js_1.db.select().from(index_js_3.maintenanceBills).where((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.id, id)).limit(1);
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
        if (paidAmount >= totalAmount)
            status = "PAID";
        else if (paidAmount > 0)
            status = "PARTIAL";
        else
            status = "UNPAID";
        if (data.status)
            status = data.status;
        await index_js_1.db
            .update(index_js_3.maintenanceBills)
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
            .where((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.id, id));
        return this.getBillById(id);
    }
    static async deleteBill(id) {
        const existing = await index_js_1.db.select().from(index_js_3.maintenanceBills).where((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Bill not found");
        }
        await index_js_1.db.delete(index_js_3.maintenanceBills).where((0, drizzle_orm_1.eq)(index_js_3.maintenanceBills.id, id));
        return { success: true, message: "Maintenance bill deleted successfully" };
    }
}
exports.MaintenanceService = MaintenanceService;
