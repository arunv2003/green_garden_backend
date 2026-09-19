"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class ReportService {
    /**
     * Monthly Financial Statement:
     * Total Maintenance Collection, Other Income, Total Expenses, Pending, Overdue, Net Balance
     */
    static async getFinancialReport(year) {
        const targetYear = year || new Date().getFullYear();
        const todayStr = new Date().toISOString().slice(0, 10);
        // 1. Total Maintenance Collected in this year
        const collectionResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.payments.amount}), 0)`,
        })
            .from(index_js_2.payments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.payments.billingYear, targetYear), (0, drizzle_orm_1.eq)(index_js_2.payments.status, "PAID")));
        const totalCollection = parseFloat(collectionResult[0]?.total || "0");
        // 2. Total Society Expenses in this year
        const expensesResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.expenses.amount}), 0)`,
        })
            .from(index_js_2.expenses)
            .where((0, drizzle_orm_1.sql) `YEAR(${index_js_2.expenses.expenseDate}) = ${targetYear}`);
        const totalExpenses = parseFloat(expensesResult[0]?.total || "0");
        // 3. Pending Maintenance for this year
        const pendingResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.pendingAmount}), 0)`,
        })
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingYear, targetYear));
        const pendingMaintenance = parseFloat(pendingResult[0]?.total || "0");
        // 4. Overdue Maintenance
        const overdueResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.pendingAmount}), 0)`,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingYear, targetYear), (0, drizzle_orm_1.sql) `${index_js_2.maintenanceBills.dueDate} < ${todayStr}`, (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.status, "UNPAID"), (0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.status, "PARTIAL"))));
        const overdueMaintenance = parseFloat(overdueResult[0]?.total || "0");
        const overdueCount = Number(overdueResult[0]?.count || 0);
        // Net Balance Formula: Total Income - Total Expenses
        const netBalance = totalCollection - totalExpenses;
        // 5. Month-by-month Collection vs Expenses
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyBillsData = await index_js_1.db
            .select({
            month: index_js_2.maintenanceBills.billingMonth,
            billed: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.totalAmount}), 0)`,
            paid: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.paidAmount}), 0)`,
            pending: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.pendingAmount}), 0)`,
        })
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingYear, targetYear))
            .groupBy(index_js_2.maintenanceBills.billingMonth)
            .orderBy(index_js_2.maintenanceBills.billingMonth);
        const monthlyExpensesData = await index_js_1.db
            .select({
            month: (0, drizzle_orm_1.sql) `MONTH(${index_js_2.expenses.expenseDate})`,
            amount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.expenses.amount}), 0)`,
        })
            .from(index_js_2.expenses)
            .where((0, drizzle_orm_1.sql) `YEAR(${index_js_2.expenses.expenseDate}) = ${targetYear}`)
            .groupBy((0, drizzle_orm_1.sql) `MONTH(${index_js_2.expenses.expenseDate})`);
        const expMap = new Map();
        monthlyExpensesData.forEach((e) => expMap.set(e.month, parseFloat(e.amount)));
        const billMap = new Map();
        monthlyBillsData.forEach((b) => billMap.set(b.month, {
            billed: parseFloat(b.billed),
            paid: parseFloat(b.paid),
            pending: parseFloat(b.pending),
        }));
        const monthlyBreakdown = monthNames.map((name, idx) => {
            const m = idx + 1;
            const b = billMap.get(m) || { billed: 0, paid: 0, pending: 0 };
            const exp = expMap.get(m) || 0;
            return {
                month: m,
                monthName: name,
                maintenanceBilled: b.billed,
                maintenanceCollected: b.paid,
                maintenancePending: b.pending,
                expenses: exp,
                netCashflow: b.paid - exp,
            };
        });
        return {
            year: targetYear,
            summary: {
                totalCollection,
                totalExpenses,
                netBalance,
                pendingMaintenance,
                overdueMaintenance,
                overdueCount,
            },
            monthlyBreakdown,
        };
    }
    /**
     * Flat-wise revenue & pending report
     */
    static async getFlatRevenueReport(year) {
        const targetYear = year || new Date().getFullYear();
        const allFlats = await index_js_1.db
            .select({
            id: index_js_2.flats.id,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            blockName: index_js_2.blocks.name,
            monthlyMaintenance: index_js_2.flats.monthlyMaintenance,
            occupancyStatus: index_js_2.flats.occupancyStatus,
        })
            .from(index_js_2.flats)
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.flats.status, "ACTIVE"))
            .orderBy(index_js_2.flats.flatNumber);
        // Active residents
        const allResidents = await index_js_1.db.select().from(index_js_2.residents).where((0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE"));
        // Bills for target year
        const yearBills = await index_js_1.db
            .select()
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingYear, targetYear));
        return allFlats.map((flat) => {
            const flatBills = yearBills.filter((b) => b.flatId === flat.id);
            const resident = allResidents.find((r) => r.flatId === flat.id);
            const billed = flatBills.reduce((acc, b) => acc + parseFloat(b.totalAmount), 0);
            const collected = flatBills.reduce((acc, b) => acc + parseFloat(b.paidAmount), 0);
            const pending = flatBills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
            return {
                flatId: flat.id,
                flatNumber: flat.flatNumber,
                flatType: flat.flatType,
                blockName: flat.blockName,
                residentName: resident?.fullName || "Vacant",
                occupancyStatus: flat.occupancyStatus,
                monthlyRate: parseFloat(flat.monthlyMaintenance),
                totalBilled: billed,
                totalCollected: collected,
                totalPending: pending,
                collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 100,
            };
        });
    }
    static async getMonthlyCollection(year) {
        return this.getFinancialReport(year);
    }
    static async getRoomRevenue(year) {
        return this.getFlatRevenueReport(year);
    }
    static async getGuestLedgerReport(year) {
        return this.getFlatRevenueReport(year);
    }
    static async exportReportCsv(type, year) {
        const report = await this.getFinancialReport(year);
        let csv = "Month,Maintenance Billed,Maintenance Collected,Pending,Expenses,Net Cashflow\n";
        report.monthlyBreakdown.forEach((m) => {
            csv += `${m.monthName},${m.maintenanceBilled},${m.maintenanceCollected},${m.maintenancePending},${m.expenses},${m.netCashflow}\n`;
        });
        return csv;
    }
}
exports.ReportService = ReportService;
