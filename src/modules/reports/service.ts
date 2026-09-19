import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  flats,
  blocks,
  residents,
  maintenanceBills,
  payments,
  expenses,
} from "../../db/schema/index.js";

export class ReportService {
  /**
   * Monthly Financial Statement:
   * Total Maintenance Collection, Other Income, Total Expenses, Pending, Overdue, Net Balance
   */
  static async getFinancialReport(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Total Maintenance Collected in this year
    const collectionResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.billingYear, targetYear),
          eq(payments.status, "PAID")
        )
      );
    const totalCollection = parseFloat(collectionResult[0]?.total || "0");

    // 2. Total Society Expenses in this year
    const expensesResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(sql`YEAR(${expenses.expenseDate}) = ${targetYear}`);
    const totalExpenses = parseFloat(expensesResult[0]?.total || "0");

    // 3. Pending Maintenance for this year
    const pendingResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${maintenanceBills.pendingAmount}), 0)`,
      })
      .from(maintenanceBills)
      .where(eq(maintenanceBills.billingYear, targetYear));
    const pendingMaintenance = parseFloat(pendingResult[0]?.total || "0");

    // 4. Overdue Maintenance
    const overdueResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${maintenanceBills.pendingAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(maintenanceBills)
      .where(
        and(
          eq(maintenanceBills.billingYear, targetYear),
          sql`${maintenanceBills.dueDate} < ${todayStr}`,
          or(eq(maintenanceBills.status, "UNPAID"), eq(maintenanceBills.status, "PARTIAL"))
        )
      );
    const overdueMaintenance = parseFloat(overdueResult[0]?.total || "0");
    const overdueCount = Number(overdueResult[0]?.count || 0);

    // Net Balance Formula: Total Income - Total Expenses
    const netBalance = totalCollection - totalExpenses;

    // 5. Month-by-month Collection vs Expenses
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyBillsData = await db
      .select({
        month: maintenanceBills.billingMonth,
        billed: sql<string>`COALESCE(SUM(${maintenanceBills.totalAmount}), 0)`,
        paid: sql<string>`COALESCE(SUM(${maintenanceBills.paidAmount}), 0)`,
        pending: sql<string>`COALESCE(SUM(${maintenanceBills.pendingAmount}), 0)`,
      })
      .from(maintenanceBills)
      .where(eq(maintenanceBills.billingYear, targetYear))
      .groupBy(maintenanceBills.billingMonth)
      .orderBy(maintenanceBills.billingMonth);

    const monthlyExpensesData = await db
      .select({
        month: sql<number>`MONTH(${expenses.expenseDate})`,
        amount: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(sql`YEAR(${expenses.expenseDate}) = ${targetYear}`)
      .groupBy(sql`MONTH(${expenses.expenseDate})`);

    const expMap = new Map<number, number>();
    monthlyExpensesData.forEach((e) => expMap.set(e.month, parseFloat(e.amount)));

    const billMap = new Map<number, { billed: number; paid: number; pending: number }>();
    monthlyBillsData.forEach((b) =>
      billMap.set(b.month, {
        billed: parseFloat(b.billed),
        paid: parseFloat(b.paid),
        pending: parseFloat(b.pending),
      })
    );

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
  static async getFlatRevenueReport(year?: number) {
    const targetYear = year || new Date().getFullYear();

    const allFlats = await db
      .select({
        id: flats.id,
        flatNumber: flats.flatNumber,
        flatType: flats.flatType,
        blockName: blocks.name,
        monthlyMaintenance: flats.monthlyMaintenance,
        occupancyStatus: flats.occupancyStatus,
      })
      .from(flats)
      .leftJoin(blocks, eq(flats.blockId, blocks.id))
      .where(eq(flats.status, "ACTIVE"))
      .orderBy(flats.flatNumber);

    // Active residents
    const allResidents = await db.select().from(residents).where(eq(residents.status, "ACTIVE"));

    // Bills for target year
    const yearBills = await db
      .select()
      .from(maintenanceBills)
      .where(eq(maintenanceBills.billingYear, targetYear));

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

  static async getMonthlyCollection(year?: number) {
    return this.getFinancialReport(year);
  }

  static async getRoomRevenue(year?: number) {
    return this.getFlatRevenueReport(year);
  }

  static async getGuestLedgerReport(year?: number) {
    return this.getFlatRevenueReport(year);
  }

  static async exportReportCsv(type: string, year?: number) {
    const report = await this.getFinancialReport(year);
    let csv = "Month,Maintenance Billed,Maintenance Collected,Pending,Expenses,Net Cashflow\n";
    report.monthlyBreakdown.forEach((m) => {
      csv += `${m.monthName},${m.maintenanceBilled},${m.maintenanceCollected},${m.maintenancePending},${m.expenses},${m.netCashflow}\n`;
    });
    return csv;
  }
}
