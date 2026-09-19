import { eq, and, sql, desc, inArray, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  flats,
  blocks,
  floors,
  residents,
  maintenanceBills,
  payments,
  visitors,
  complaints,
  announcements,
  expenses,
  users,
} from "../../db/schema/index.js";

export class DashboardService {
  /**
   * Secretary Society Operations Dashboard
   */
  static async getSecretaryStats() {
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Flats overview
    const allFlats = await db.select().from(flats).where(eq(flats.status, "ACTIVE"));
    const totalFlats = allFlats.length;
    const occupiedFlats = allFlats.filter((f) => f.occupancyStatus === "OCCUPIED").length;
    const vacantFlats = allFlats.filter((f) => f.occupancyStatus === "VACANT").length;
    const maintenanceFlats = allFlats.filter((f) => f.occupancyStatus === "UNDER_MAINTENANCE").length;

    // 2. Residents overview
    const allResidents = await db.select().from(residents).where(eq(residents.status, "ACTIVE"));
    const totalResidents = allResidents.length;
    const totalOwners = allResidents.filter((r) => r.residentType === "OWNER").length;
    const totalTenants = allResidents.filter((r) => r.residentType === "TENANT").length;

    // 3. Visitors Today
    const todayVisitors = await db
      .select()
      .from(visitors)
      .where(eq(visitors.entryDate, todayStr));

    const currentlyInsideVisitors = await db
      .select()
      .from(visitors)
      .where(eq(visitors.status, "INSIDE"));

    // 4. Open Complaints
    const openComplaints = await db
      .select()
      .from(complaints)
      .where(or(eq(complaints.status, "OPEN"), eq(complaints.status, "IN_PROGRESS")));

    // 5. Total Pending Maintenance
    const pendingSumResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${maintenanceBills.pendingAmount}), 0)`,
      })
      .from(maintenanceBills);
    const totalPendingMaintenance = parseFloat(pendingSumResult[0]?.total || "0");

    // 6. Recent Visitor entries
    const recentVisitors = await db
      .select({
        id: visitors.id,
        visitorName: visitors.visitorName,
        mobile: visitors.mobile,
        purpose: visitors.purpose,
        entryTime: visitors.entryTime,
        status: visitors.status,
        flatNumber: flats.flatNumber,
      })
      .from(visitors)
      .leftJoin(flats, eq(visitors.flatId, flats.id))
      .orderBy(desc(visitors.entryDate), desc(visitors.entryTime))
      .limit(5);

    // 7. Recent Complaints
    const recentComplaints = await db
      .select({
        id: complaints.id,
        subject: complaints.subject,
        category: complaints.category,
        priority: complaints.priority,
        status: complaints.status,
        createdAt: complaints.createdAt,
        flatNumber: flats.flatNumber,
      })
      .from(complaints)
      .leftJoin(flats, eq(complaints.flatId, flats.id))
      .orderBy(desc(complaints.createdAt))
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
    const currentMonthResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.billingMonth, currentMonth),
          eq(payments.billingYear, currentYear),
          eq(payments.status, "PAID")
        )
      );
    const currentMonthCollection = parseFloat(currentMonthResult[0]?.total || "0");

    // 2. Lifetime Total Collection
    const totalCollectedResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(eq(payments.status, "PAID"));
    const totalCollection = parseFloat(totalCollectedResult[0]?.total || "0");

    // 3. Total Pending Maintenance
    const totalPendingResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${maintenanceBills.pendingAmount}), 0)`,
      })
      .from(maintenanceBills);
    const totalPending = parseFloat(totalPendingResult[0]?.total || "0");

    // 4. Overdue Amount
    const todayStr = now.toISOString().slice(0, 10);
    const overdueResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${maintenanceBills.pendingAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(maintenanceBills)
      .where(
        and(
          sql`${maintenanceBills.dueDate} < ${todayStr}`,
          or(eq(maintenanceBills.status, "UNPAID"), eq(maintenanceBills.status, "PARTIAL"))
        )
      );
    const overdueAmount = parseFloat(overdueResult[0]?.total || "0");
    const overdueCount = Number(overdueResult[0]?.count || 0);

    // 5. Bills breakdown
    const allBills = await db.select().from(maintenanceBills);
    const paidBillsCount = allBills.filter((b) => b.status === "PAID").length;
    const partialBillsCount = allBills.filter((b) => b.status === "PARTIAL").length;
    const unpaidBillsCount = allBills.filter((b) => b.status === "UNPAID" || b.status === "OVERDUE").length;

    // 6. Total Society Expenses
    const expensesResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses);
    const totalExpenses = parseFloat(expensesResult[0]?.total || "0");

    // Net Balance formula: Total Income - Total Expenses
    const netBalance = totalCollection - totalExpenses;

    // 7. Recent Payments
    const recentPayments = await db
      .select({
        id: payments.id,
        receiptNumber: payments.receiptNumber,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        status: payments.status,
        flatNumber: flats.flatNumber,
        residentName: residents.fullName,
      })
      .from(payments)
      .leftJoin(flats, eq(payments.flatId, flats.id))
      .leftJoin(residents, eq(payments.residentId, residents.id))
      .orderBy(desc(payments.paymentDate))
      .limit(6);

    // 8. Monthly Collections Chart (Current Year)
    const monthlyChartData = await db
      .select({
        month: maintenanceBills.billingMonth,
        year: maintenanceBills.billingYear,
        billed: sql<string>`COALESCE(SUM(${maintenanceBills.totalAmount}), 0)`,
        paid: sql<string>`COALESCE(SUM(${maintenanceBills.paidAmount}), 0)`,
        pending: sql<string>`COALESCE(SUM(${maintenanceBills.pendingAmount}), 0)`,
      })
      .from(maintenanceBills)
      .where(eq(maintenanceBills.billingYear, currentYear))
      .groupBy(maintenanceBills.billingMonth, maintenanceBills.billingYear)
      .orderBy(maintenanceBills.billingMonth);

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
  static async getUserStats(userId: number) {
    // 1. Find resident flat
    const resList = await db
      .select({
        id: residents.id,
        flatId: residents.flatId,
        residentType: residents.residentType,
        fullName: residents.fullName,
        moveInDate: residents.moveInDate,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        blockName: blocks.name,
        floorNumber: floors.floorNumber,
        monthlyMaintenance: flats.monthlyMaintenance,
      })
      .from(residents)
      .leftJoin(flats, eq(residents.flatId, flats.id))
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .leftJoin(floors, eq(flats.floorId, floors.id))
      .where(and(eq(residents.userId, userId), eq(residents.status, "ACTIVE")))
      .limit(1);

    const resident = resList[0] || null;
    const flatId = resident?.flatId;

    let bills: any[] = [];
    let paymentsList: any[] = [];
    let totalPending = 0;
    let totalPaid = 0;
    let currentBill: any = null;

    if (flatId) {
      bills = await db
        .select()
        .from(maintenanceBills)
        .where(eq(maintenanceBills.flatId, flatId))
        .orderBy(desc(maintenanceBills.billingYear), desc(maintenanceBills.billingMonth));

      totalPending = bills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
      totalPaid = bills.reduce((acc, b) => acc + parseFloat(b.paidAmount), 0);
      currentBill = bills[0] || null;

      paymentsList = await db
        .select()
        .from(payments)
        .where(eq(payments.flatId, flatId))
        .orderBy(desc(payments.paymentDate))
        .limit(5);
    }

    // Recent announcements
    const recentNotices = await db
      .select()
      .from(announcements)
      .where(eq(announcements.status, "ACTIVE"))
      .orderBy(desc(announcements.publishDate))
      .limit(3);

    // User's open complaints
    const userComplaints = await db
      .select()
      .from(complaints)
      .where(eq(complaints.createdBy, userId))
      .orderBy(desc(complaints.createdAt))
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
