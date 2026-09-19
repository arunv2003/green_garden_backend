"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class ExpenseService {
    static async getAllExpenses(filters) {
        let conditions = [];
        if (filters?.category && filters.category !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.expenses.category, filters.category));
        }
        const list = await index_js_1.db
            .select({
            id: index_js_2.expenses.id,
            societyId: index_js_2.expenses.societyId,
            category: index_js_2.expenses.category,
            title: index_js_2.expenses.title,
            amount: index_js_2.expenses.amount,
            expenseDate: index_js_2.expenses.expenseDate,
            paymentMethod: index_js_2.expenses.paymentMethod,
            vendor: index_js_2.expenses.vendor,
            description: index_js_2.expenses.description,
            receiptUrl: index_js_2.expenses.receiptUrl,
            createdBy: index_js_2.expenses.createdBy,
            creatorName: index_js_2.users.name,
            createdAt: index_js_2.expenses.createdAt,
        })
            .from(index_js_2.expenses)
            .leftJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.expenses.createdBy, index_js_2.users.id))
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.expenses.expenseDate));
        let filtered = list;
        if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            filtered = filtered.filter((e) => e.title.toLowerCase().includes(q) ||
                e.category.toLowerCase().includes(q) ||
                (e.vendor && e.vendor.toLowerCase().includes(q)) ||
                (e.description && e.description.toLowerCase().includes(q)));
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
    static async createExpense(data, authorUserId) {
        const res = await index_js_1.db.insert(index_js_2.expenses).values({
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
        await index_js_1.db.insert(index_js_2.auditLogs).values({
            userId: authorUserId,
            action: "RECORD_EXPENSE",
            module: "EXPENSES",
            recordId: newId,
            newData: JSON.stringify({ title: data.title, amount: data.amount, category: data.category }),
        });
        const created = await index_js_1.db.select().from(index_js_2.expenses).where((0, drizzle_orm_1.eq)(index_js_2.expenses.id, newId)).limit(1);
        return created[0];
    }
    static async updateExpense(id, data, operatorId) {
        const existing = await index_js_1.db.select().from(index_js_2.expenses).where((0, drizzle_orm_1.eq)(index_js_2.expenses.id, id)).limit(1);
        if (existing.length === 0) {
            throw new Error("Expense not found");
        }
        const payload = {};
        if (data.title !== undefined)
            payload.title = data.title.trim();
        if (data.category !== undefined)
            payload.category = data.category;
        if (data.amount !== undefined)
            payload.amount = parseFloat(data.amount).toFixed(2);
        if (data.expenseDate !== undefined)
            payload.expenseDate = data.expenseDate;
        if (data.paymentMethod !== undefined)
            payload.paymentMethod = data.paymentMethod;
        if (data.vendor !== undefined)
            payload.vendor = data.vendor ? data.vendor.trim() : null;
        if (data.description !== undefined)
            payload.description = data.description ? data.description.trim() : null;
        await index_js_1.db.update(index_js_2.expenses).set(payload).where((0, drizzle_orm_1.eq)(index_js_2.expenses.id, id));
        const updated = await index_js_1.db.select().from(index_js_2.expenses).where((0, drizzle_orm_1.eq)(index_js_2.expenses.id, id)).limit(1);
        return updated[0];
    }
    static async deleteExpense(id, operatorId) {
        await index_js_1.db.delete(index_js_2.expenses).where((0, drizzle_orm_1.eq)(index_js_2.expenses.id, id));
        return { success: true, message: "Expense record removed" };
    }
}
exports.ExpenseService = ExpenseService;
