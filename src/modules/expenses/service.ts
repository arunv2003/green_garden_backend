import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { expenses, users, auditLogs } from "../../db/schema/index.js";

export class ExpenseService {
  static async getAllExpenses(filters?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let conditions: any[] = [];

    if (filters?.category && filters.category !== "ALL") {
      conditions.push(eq(expenses.category, filters.category as any));
    }

    const list = await db
      .select({
        id: expenses.id,
        societyId: expenses.societyId,
        category: expenses.category,
        title: expenses.title,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        paymentMethod: expenses.paymentMethod,
        vendor: expenses.vendor,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        createdBy: expenses.createdBy,
        creatorName: users.name,
        createdAt: expenses.createdAt,
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.createdBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expenses.expenseDate));

    let filtered = list;
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.vendor && e.vendor.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q))
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

    const totalExpenseAmount = filtered.reduce((acc, e) => acc + parseFloat(e.amount), 0);

    return {
      items,
      summary: {
        totalExpenseAmount,
        totalRecords: total,
      },
      meta: {
        total,
        page,
        limit: filters?.limit || total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async createExpense(data: any, authorUserId: number) {
    const res = await db.insert(expenses).values({
      societyId: 1,
      category: data.category || "OTHER",
      title: data.title.trim(),
      amount: parseFloat(data.amount).toFixed(2),
      expenseDate: data.expenseDate || new Date().toISOString().slice(0, 10),
      paymentMethod: data.paymentMethod || "BANK_TRANSFER",
      vendor: data.vendor ? data.vendor.trim() : null,
      description: data.description ? data.description.trim() : null,
      receiptUrl: data.receiptUrl || null,
      createdBy: authorUserId,
    });

    const newId = res[0].insertId;

    await db.insert(auditLogs).values({
      userId: authorUserId,
      action: "RECORD_EXPENSE",
      module: "EXPENSES",
      recordId: newId,
      newData: JSON.stringify({ title: data.title, amount: data.amount, category: data.category }),
    });

    const created = await db.select().from(expenses).where(eq(expenses.id, newId)).limit(1);
    return created[0];
  }

  static async updateExpense(id: number, data: any, operatorId?: number) {
    const existing = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    if (existing.length === 0) {
      throw new Error("Expense not found");
    }

    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title.trim();
    if (data.category !== undefined) payload.category = data.category;
    if (data.amount !== undefined) payload.amount = parseFloat(data.amount).toFixed(2);
    if (data.expenseDate !== undefined) payload.expenseDate = data.expenseDate;
    if (data.paymentMethod !== undefined) payload.paymentMethod = data.paymentMethod;
    if (data.vendor !== undefined) payload.vendor = data.vendor ? data.vendor.trim() : null;
    if (data.description !== undefined) payload.description = data.description ? data.description.trim() : null;

    await db.update(expenses).set(payload).where(eq(expenses.id, id));
    const updated = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    return updated[0];
  }

  static async deleteExpense(id: number, operatorId?: number) {
    await db.delete(expenses).where(eq(expenses.id, id));
    return { success: true, message: "Expense record removed" };
  }
}
