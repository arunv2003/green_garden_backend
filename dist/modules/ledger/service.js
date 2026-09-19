"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class LedgerService {
    /**
     * All Flast / Residents Ledger for a given year
     */
    static async getAllLedgers(filters) {
        const targetYear = filters?.year || new Date().getFullYear();
        // 1. Fetch all active flats
        const allFlats = await index_js_1.db
            .select({
            id: index_js_2.flats.id,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            blockName: index_js_2.blocks.name,
            monthlyMaintenance: index_js_2.flats.monthlyMaintenance,
        })
            .from(index_js_2.flats)
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.flats.status, "ACTIVE"))
            .orderBy(index_js_2.flats.flatNumber);
        // 2. Fetch active residents for flats
        const allResidents = await index_js_1.db
            .select()
            .from(index_js_2.residents)
            .where((0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE"));
        // 3. Fetch maintenance bills for target year
        const allBills = await index_js_1.db
            .select()
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingYear, targetYear));
        const billsByFlat = new Map();
        allBills.forEach((b) => {
            const list = billsByFlat.get(b.flatId) || [];
            list.push(b);
            billsByFlat.set(b.flatId, list);
        });
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const ledgers = allFlats.map((flat) => {
            const flatBills = billsByFlat.get(flat.id) || [];
            const flatRes = allResidents.find((r) => r.flatId === flat.id);
            const monthsData = monthNames.map((monthName, idx) => {
                const monthNum = idx + 1;
                const bill = flatBills.find((b) => b.billingMonth === monthNum);
                return {
                    month: monthNum,
                    monthName,
                    billAmount: bill ? parseFloat(bill.totalAmount) : 0,
                    paidAmount: bill ? parseFloat(bill.paidAmount) : 0,
                    pendingAmount: bill ? parseFloat(bill.pendingAmount) : 0,
                    status: bill ? bill.status : "N/A",
                };
            });
            const totalBilled = flatBills.reduce((acc, b) => acc + parseFloat(b.totalAmount), 0);
            const totalPaid = flatBills.reduce((acc, b) => acc + parseFloat(b.paidAmount), 0);
            const totalPending = flatBills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
            return {
                flat,
                resident: flatRes || null,
                year: targetYear,
                months: monthsData,
                summary: {
                    totalBilled,
                    totalPaid,
                    totalPending,
                },
            };
        });
        let filtered = ledgers;
        if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            filtered = filtered.filter((l) => l.flat.flatNumber.toLowerCase().includes(q) ||
                l.flat.blockName?.toLowerCase().includes(q) ||
                (l.resident?.fullName && l.resident.fullName.toLowerCase().includes(q)) ||
                (l.resident?.mobile && l.resident.mobile.includes(q)));
        }
        const total = filtered.length;
        let items = filtered;
        const page = filters?.page ? Math.max(1, filters.page) : 1;
        const limit = filters?.limit ? Math.max(1, filters.limit) : total;
        if (filters?.page && filters?.limit) {
            const offset = (page - 1) * limit;
            items = filtered.slice(offset, offset + limit);
        }
        const grandBilled = filtered.reduce((acc, l) => acc + l.summary.totalBilled, 0);
        const grandPaid = filtered.reduce((acc, l) => acc + l.summary.totalPaid, 0);
        const grandPending = filtered.reduce((acc, l) => acc + l.summary.totalPending, 0);
        return {
            items,
            grandSummary: {
                grandBilled,
                grandPaid,
                grandPending,
            },
            meta: {
                total,
                page,
                limit: filters?.limit || total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    /**
     * Flat-specific Ledger
     */
    static async getFlatLedger(flatId, year) {
        const targetYear = year || new Date().getFullYear();
        const flatRecord = await index_js_1.db
            .select({
            id: index_js_2.flats.id,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            blockName: index_js_2.blocks.name,
            monthlyMaintenance: index_js_2.flats.monthlyMaintenance,
        })
            .from(index_js_2.flats)
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.flats.id, flatId))
            .limit(1);
        if (flatRecord.length === 0) {
            throw new Error("Flat not found");
        }
        const flat = flatRecord[0];
        // Resident
        const resList = await index_js_1.db
            .select()
            .from(index_js_2.residents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.residents.flatId, flatId), (0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE")))
            .limit(1);
        // Bills
        const bills = await index_js_1.db
            .select()
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.flatId, flatId), (0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingYear, targetYear)))
            .orderBy(index_js_2.maintenanceBills.billingMonth);
        // Payments
        const payList = await index_js_1.db
            .select()
            .from(index_js_2.payments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.payments.flatId, flatId), (0, drizzle_orm_1.eq)(index_js_2.payments.billingYear, targetYear)))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.payments.paymentDate));
        const totalBilled = bills.reduce((acc, b) => acc + parseFloat(b.totalAmount), 0);
        const totalPaid = bills.reduce((acc, b) => acc + parseFloat(b.paidAmount), 0);
        const totalPending = bills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
        return {
            flat,
            currentResident: resList[0] || null,
            year: targetYear,
            bills,
            payments: payList,
            summary: {
                totalBilled,
                totalPaid,
                totalPending,
            },
        };
    }
    /**
     * Resident-specific Ledger
     */
    static async getUserLedger(userId, year) {
        const targetYear = year || new Date().getFullYear();
        // Check if user is linked to a resident
        const resList = await index_js_1.db
            .select()
            .from(index_js_2.residents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.residents.userId, userId), (0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE")))
            .limit(1);
        if (resList.length > 0) {
            return this.getFlatLedger(resList[0].flatId, targetYear);
        }
        // Fallback if no active resident flat
        const userRecords = await index_js_1.db.select().from(index_js_2.users).where((0, drizzle_orm_1.eq)(index_js_2.users.id, userId)).limit(1);
        return {
            user: userRecords[0] || null,
            flat: null,
            year: targetYear,
            bills: [],
            payments: [],
            summary: { totalBilled: 0, totalPaid: 0, totalPending: 0 },
        };
    }
}
exports.LedgerService = LedgerService;
