"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class DashboardService {
    /**
     * Secretary Society Operations Dashboard
     */
    static async getSecretaryStats() {
        const todayStr = new Date().toISOString().slice(0, 10);
        // 1. Flats overview
        const allFlats = await index_js_1.db.select().from(index_js_2.flats).where((0, drizzle_orm_1.eq)(index_js_2.flats.status, "ACTIVE"));
        const totalFlats = allFlats.length;
        const occupiedFlats = allFlats.filter((f) => f.occupancyStatus === "OCCUPIED").length;
        const vacantFlats = allFlats.filter((f) => f.occupancyStatus === "VACANT").length;
        const maintenanceFlats = allFlats.filter((f) => f.occupancyStatus === "UNDER_MAINTENANCE").length;
        // 2. Residents overview
        const allResidents = await index_js_1.db.select().from(index_js_2.residents).where((0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE"));
        const totalResidents = allResidents.length;
        const totalOwners = allResidents.filter((r) => r.residentType === "OWNER").length;
        const totalTenants = allResidents.filter((r) => r.residentType === "TENANT").length;
        // 3. Visitors Today
        const todayVisitors = await index_js_1.db
            .select()
            .from(index_js_2.visitors)
            .where((0, drizzle_orm_1.eq)(index_js_2.visitors.entryDate, todayStr));
        const currentlyInsideVisitors = await index_js_1.db
            .select()
            .from(index_js_2.visitors)
            .where((0, drizzle_orm_1.eq)(index_js_2.visitors.status, "INSIDE"));
        // 4. Open Complaints
        const openComplaints = await index_js_1.db
            .select()
            .from(index_js_2.complaints)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.complaints.status, "OPEN"), (0, drizzle_orm_1.eq)(index_js_2.complaints.status, "IN_PROGRESS")));
        // 5. Total Pending Maintenance
        const pendingSumResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.pendingAmount}), 0)`,
        })
            .from(index_js_2.maintenanceBills);
        const totalPendingMaintenance = parseFloat(pendingSumResult[0]?.total || "0");
        // 6. Recent Visitor entries
        const recentVisitors = await index_js_1.db
            .select({
            id: index_js_2.visitors.id,
            visitorName: index_js_2.visitors.visitorName,
            mobile: index_js_2.visitors.mobile,
            purpose: index_js_2.visitors.purpose,
            entryTime: index_js_2.visitors.entryTime,
            status: index_js_2.visitors.status,
            flatNumber: index_js_2.flats.flatNumber,
        })
            .from(index_js_2.visitors)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.visitors.flatId, index_js_2.flats.id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.visitors.entryDate), (0, drizzle_orm_1.desc)(index_js_2.visitors.entryTime))
            .limit(5);
        // 7. Recent Complaints
        const recentComplaints = await index_js_1.db
            .select({
            id: index_js_2.complaints.id,
            subject: index_js_2.complaints.subject,
            category: index_js_2.complaints.category,
            priority: index_js_2.complaints.priority,
            status: index_js_2.complaints.status,
            createdAt: index_js_2.complaints.createdAt,
            flatNumber: index_js_2.flats.flatNumber,
        })
            .from(index_js_2.complaints)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.complaints.flatId, index_js_2.flats.id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.complaints.createdAt))
            .limit(5);
        return {
            totalFlats,
            occupiedFlats,
            vacantFlats,
            maintenanceFlats,
            totalResidents,
            totalOwners,
            totalTenants,
            todayVisitorsCount: todayVisitors.length,
            currentlyInsideCount: currentlyInsideVisitors.length,
            openComplaintsCount: openComplaints.length,
            totalPendingMaintenance,
            recentVisitors,
            recentComplaints,
        };
    }
    /**
     * Accountant Financial Operations Dashboard
     */
    static async getAccountantStats() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        // 1. Current Month Collection
        const currentMonthResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.payments.amount}), 0)`,
        })
            .from(index_js_2.payments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.payments.billingMonth, currentMonth), (0, drizzle_orm_1.eq)(index_js_2.payments.billingYear, currentYear), (0, drizzle_orm_1.eq)(index_js_2.payments.status, "PAID")));
        const currentMonthCollection = parseFloat(currentMonthResult[0]?.total || "0");
        // 2. Lifetime Total Collection
        const totalCollectedResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.payments.amount}), 0)`,
        })
            .from(index_js_2.payments)
            .where((0, drizzle_orm_1.eq)(index_js_2.payments.status, "PAID"));
        const totalCollection = parseFloat(totalCollectedResult[0]?.total || "0");
        // 3. Total Pending Maintenance
        const totalPendingResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.pendingAmount}), 0)`,
        })
            .from(index_js_2.maintenanceBills);
        const totalPending = parseFloat(totalPendingResult[0]?.total || "0");
        // 4. Overdue Amount
        const todayStr = now.toISOString().slice(0, 10);
        const overdueResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.pendingAmount}), 0)`,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${index_js_2.maintenanceBills.dueDate} < ${todayStr}`, (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.status, "UNPAID"), (0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.status, "PARTIAL"))));
        const overdueAmount = parseFloat(overdueResult[0]?.total || "0");
        const overdueCount = Number(overdueResult[0]?.count || 0);
        // 5. Bills breakdown
        const allBills = await index_js_1.db.select().from(index_js_2.maintenanceBills);
        const paidBillsCount = allBills.filter((b) => b.status === "PAID").length;
        const partialBillsCount = allBills.filter((b) => b.status === "PARTIAL").length;
        const unpaidBillsCount = allBills.filter((b) => b.status === "UNPAID" || b.status === "OVERDUE").length;
        // 6. Total Society Expenses
        const expensesResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.expenses.amount}), 0)`,
        })
            .from(index_js_2.expenses);
        const totalExpenses = parseFloat(expensesResult[0]?.total || "0");
        // Net Balance formula: Total Income - Total Expenses
        const netBalance = totalCollection - totalExpenses;
        // 7. Recent Payments
        const recentPayments = await index_js_1.db
            .select({
            id: index_js_2.payments.id,
            receiptNumber: index_js_2.payments.receiptNumber,
            amount: index_js_2.payments.amount,
            paymentDate: index_js_2.payments.paymentDate,
            paymentMethod: index_js_2.payments.paymentMethod,
            status: index_js_2.payments.status,
            flatNumber: index_js_2.flats.flatNumber,
            residentName: index_js_2.residents.fullName,
        })
            .from(index_js_2.payments)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.payments.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.residents, (0, drizzle_orm_1.eq)(index_js_2.payments.residentId, index_js_2.residents.id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.payments.paymentDate))
            .limit(6);
        // 8. Monthly Collections Chart (Current Year)
        const monthlyChartData = await index_js_1.db
            .select({
            month: index_js_2.maintenanceBills.billingMonth,
            year: index_js_2.maintenanceBills.billingYear,
            billed: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.totalAmount}), 0)`,
            paid: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.paidAmount}), 0)`,
            pending: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.maintenanceBills.pendingAmount}), 0)`,
        })
            .from(index_js_2.maintenanceBills)
            .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingYear, currentYear))
            .groupBy(index_js_2.maintenanceBills.billingMonth, index_js_2.maintenanceBills.billingYear)
            .orderBy(index_js_2.maintenanceBills.billingMonth);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chart = monthlyChartData.map((d) => ({
            month: monthNames[d.month - 1] || `M${d.month}`,
            billed: parseFloat(d.billed),
            paid: parseFloat(d.paid),
            pending: parseFloat(d.pending),
        }));
        return {
            currentMonthCollection,
            totalCollection,
            totalPending,
            overdueAmount,
            overdueCount,
            paidBillsCount,
            partialBillsCount,
            unpaidBillsCount,
            totalExpenses,
            netBalance,
            recentPayments,
            chart,
        };
    }
    /**
     * Resident / User Dashboard
     */
    static async getUserStats(userId) {
        // 1. Find resident flat
        const resList = await index_js_1.db
            .select({
            id: index_js_2.residents.id,
            flatId: index_js_2.residents.flatId,
            residentType: index_js_2.residents.residentType,
            fullName: index_js_2.residents.fullName,
            moveInDate: index_js_2.residents.moveInDate,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            blockName: index_js_2.blocks.name,
            floorNumber: index_js_2.floors.floorNumber,
            monthlyMaintenance: index_js_2.flats.monthlyMaintenance,
        })
            .from(index_js_2.residents)
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.residents.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.floors, (0, drizzle_orm_1.eq)(index_js_2.flats.floorId, index_js_2.floors.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.residents.userId, userId), (0, drizzle_orm_1.eq)(index_js_2.residents.status, "ACTIVE")))
            .limit(1);
        const resident = resList[0] || null;
        const flatId = resident?.flatId;
        let bills = [];
        let paymentsList = [];
        let totalPending = 0;
        let totalPaid = 0;
        let currentBill = null;
        if (flatId) {
            bills = await index_js_1.db
                .select()
                .from(index_js_2.maintenanceBills)
                .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.flatId, flatId))
                .orderBy((0, drizzle_orm_1.desc)(index_js_2.maintenanceBills.billingYear), (0, drizzle_orm_1.desc)(index_js_2.maintenanceBills.billingMonth));
            totalPending = bills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
            totalPaid = bills.reduce((acc, b) => acc + parseFloat(b.paidAmount), 0);
            currentBill = bills[0] || null;
            paymentsList = await index_js_1.db
                .select()
                .from(index_js_2.payments)
                .where((0, drizzle_orm_1.eq)(index_js_2.payments.flatId, flatId))
                .orderBy((0, drizzle_orm_1.desc)(index_js_2.payments.paymentDate))
                .limit(5);
        }
        // Recent announcements
        const recentNotices = await index_js_1.db
            .select()
            .from(index_js_2.announcements)
            .where((0, drizzle_orm_1.eq)(index_js_2.announcements.status, "ACTIVE"))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.announcements.publishDate))
            .limit(3);
        // User's open complaints
        const userComplaints = await index_js_1.db
            .select()
            .from(index_js_2.complaints)
            .where((0, drizzle_orm_1.eq)(index_js_2.complaints.createdBy, userId))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.complaints.createdAt))
            .limit(5);
        return {
            resident,
            myFlat: resident
                ? {
                    flatNumber: resident.flatNumber,
                    blockName: resident.blockName,
                    floorNumber: resident.floorNumber,
                    flatType: resident.flatType,
                    residentType: resident.residentType,
                    monthlyMaintenance: parseFloat(resident.monthlyMaintenance || "3000"),
                }
                : null,
            currentBill,
            financialSummary: {
                totalPaid,
                totalPending,
            },
            recentPayments: paymentsList,
            recentNotices,
            myComplaints: userComplaints,
        };
    }
}
exports.DashboardService = DashboardService;
