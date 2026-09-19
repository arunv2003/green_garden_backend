"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
const receipt_js_1 = require("../../utils/receipt.js");
class PaymentService {
    static async getAllPayments(filters) {
        let query = index_js_1.db
            .select({
            id: index_js_2.payments.id,
            societyId: index_js_2.payments.societyId,
            userId: index_js_2.payments.userId,
            userName: index_js_2.users.name,
            userMobile: index_js_2.users.mobile,
            residentId: index_js_2.payments.residentId,
            residentName: index_js_2.residents.fullName,
            flatId: index_js_2.payments.flatId,
            flatNumber: index_js_2.flats.flatNumber,
            blockName: index_js_2.blocks.name,
            roomId: index_js_2.payments.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            stayId: index_js_2.payments.stayId,
            maintenanceBillId: index_js_2.payments.maintenanceBillId,
            monthlyBillId: index_js_2.payments.monthlyBillId,
            billingMonth: index_js_2.payments.billingMonth,
            billingYear: index_js_2.payments.billingYear,
            amount: index_js_2.payments.amount,
            paymentDate: index_js_2.payments.paymentDate,
            paymentMethod: index_js_2.payments.paymentMethod,
            transactionId: index_js_2.payments.transactionId,
            receiptNumber: index_js_2.payments.receiptNumber,
            status: index_js_2.payments.status,
            previousPending: index_js_2.payments.previousPending,
            remainingPending: index_js_2.payments.remainingPending,
            remarks: index_js_2.payments.remarks,
            createdAt: index_js_2.payments.createdAt,
        })
            .from(index_js_2.payments)
            .leftJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.payments.userId, index_js_2.users.id))
            .leftJoin(index_js_2.residents, (0, drizzle_orm_1.eq)(index_js_2.payments.residentId, index_js_2.residents.id))
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.payments.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.payments.roomId, index_js_2.rooms.id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.payments.paymentDate), (0, drizzle_orm_1.desc)(index_js_2.payments.id));
        const allPayments = await query;
        const filtered = allPayments.filter((p) => {
            if (filters?.userId && p.userId !== filters.userId)
                return false;
            if (filters?.residentId && p.residentId !== filters.residentId)
                return false;
            if (filters?.flatId && p.flatId !== filters.flatId)
                return false;
            if (filters?.roomId && p.roomId !== filters.roomId)
                return false;
            if (filters?.month && p.billingMonth !== filters.month)
                return false;
            if (filters?.year && p.billingYear !== filters.year)
                return false;
            if (filters?.paymentMethod && filters.paymentMethod !== "ALL" && p.paymentMethod !== filters.paymentMethod)
                return false;
            if (filters?.status && filters.status !== "ALL" && p.status !== filters.status)
                return false;
            if (filters?.search) {
                const q = filters.search.toLowerCase().trim();
                const displayFlat = p.flatNumber || p.roomNumber || "";
                const displayName = p.residentName || p.userName || "";
                const matches = displayName.toLowerCase().includes(q) ||
                    displayFlat.toLowerCase().includes(q) ||
                    p.receiptNumber?.toLowerCase().includes(q) ||
                    p.userMobile?.includes(q) ||
                    (p.transactionId && p.transactionId.toLowerCase().includes(q));
                if (!matches)
                    return false;
            }
            return true;
        });
        const total = filtered.length;
        let items = filtered;
        const page = filters?.page ? Math.max(1, filters.page) : 1;
        const limit = filters?.limit ? Math.max(1, filters.limit) : total;
        if (filters?.page && filters?.limit) {
            const offset = (page - 1) * limit;
            items = filtered.slice(offset, offset + limit);
        }
        const totalCollected = filtered.reduce((acc, p) => acc + (p.status === "PAID" ? parseFloat(p.amount) : 0), 0);
        return {
            items,
            summary: {
                totalCollected,
                totalTransactions: total,
            },
            meta: {
                total,
                page,
                limit: filters?.limit || total,
                totalPages: filters?.limit ? Math.ceil(total / limit) || 1 : 1,
            },
        };
    }
    static async getPaymentById(id) {
        const paymentRecords = await index_js_1.db
            .select({
            id: index_js_2.payments.id,
            societyId: index_js_2.payments.societyId,
            userId: index_js_2.payments.userId,
            userName: index_js_2.users.name,
            userEmail: index_js_2.users.email,
            userMobile: index_js_2.users.mobile,
            residentId: index_js_2.payments.residentId,
            residentName: index_js_2.residents.fullName,
            flatId: index_js_2.payments.flatId,
            flatNumber: index_js_2.flats.flatNumber,
            flatType: index_js_2.flats.flatType,
            blockName: index_js_2.blocks.name,
            roomId: index_js_2.payments.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            stayId: index_js_2.payments.stayId,
            maintenanceBillId: index_js_2.payments.maintenanceBillId,
            monthlyBillId: index_js_2.payments.monthlyBillId,
            billingMonth: index_js_2.payments.billingMonth,
            billingYear: index_js_2.payments.billingYear,
            amount: index_js_2.payments.amount,
            paymentDate: index_js_2.payments.paymentDate,
            paymentMethod: index_js_2.payments.paymentMethod,
            transactionId: index_js_2.payments.transactionId,
            receiptNumber: index_js_2.payments.receiptNumber,
            status: index_js_2.payments.status,
            previousPending: index_js_2.payments.previousPending,
            remainingPending: index_js_2.payments.remainingPending,
            remarks: index_js_2.payments.remarks,
            createdBy: index_js_2.payments.createdBy,
            verifiedBy: index_js_2.payments.verifiedBy,
            createdAt: index_js_2.payments.createdAt,
        })
            .from(index_js_2.payments)
            .leftJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.payments.userId, index_js_2.users.id))
            .leftJoin(index_js_2.residents, (0, drizzle_orm_1.eq)(index_js_2.payments.residentId, index_js_2.residents.id))
            .leftJoin(index_js_2.flats, (0, drizzle_orm_1.eq)(index_js_2.payments.flatId, index_js_2.flats.id))
            .leftJoin(index_js_2.blocks, (0, drizzle_orm_1.eq)(index_js_2.flats.blockId, index_js_2.blocks.id))
            .leftJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.payments.roomId, index_js_2.rooms.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.payments.id, id))
            .limit(1);
        if (paymentRecords.length === 0) {
            throw new Error("Payment record not found");
        }
        return paymentRecords[0];
    }
    static async getReceipt(paymentId) {
        const payment = await this.getPaymentById(paymentId);
        // Fetch creator/receiver details
        let receiverName = "Accounts Desk";
        if (payment.createdBy) {
            const creator = await index_js_1.db
                .select({ name: index_js_2.users.name, role: index_js_2.users.role })
                .from(index_js_2.users)
                .where((0, drizzle_orm_1.eq)(index_js_2.users.id, payment.createdBy))
                .limit(1);
            if (creator.length > 0) {
                receiverName = `${creator[0].name} (${creator[0].role})`;
            }
        }
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const displayFlat = payment.flatNumber || payment.roomNumber || "Flat";
        const displayName = payment.residentName || payment.userName || "Resident";
        return {
            societyName: "GREEN GARDEN RESIDENTIAL SOCIETY",
            tagline: "Maintenance & Facility Management",
            address: "Plot 12, Green Garden Enclave, Gomti Nagar, Lucknow, UP - 226010",
            receiptNumber: payment.receiptNumber,
            paymentId: payment.id,
            paymentDate: payment.paymentDate,
            residentName: displayName,
            residentEmail: payment.userEmail,
            residentMobile: payment.userMobile,
            flatNumber: displayFlat,
            blockName: payment.blockName || "Tower A",
            billingPeriod: `${monthNames[payment.billingMonth - 1]} ${payment.billingYear}`,
            amount: parseFloat(payment.amount),
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId || "N/A",
            status: payment.status,
            previousPending: parseFloat(payment.previousPending),
            currentPayment: parseFloat(payment.amount),
            remainingPending: parseFloat(payment.remainingPending),
            receivedBy: receiverName,
            remarks: payment.remarks || "Payment received with thanks.",
            issuedAt: payment.createdAt,
        };
    }
    static async createPayment(data, createdByUserId) {
        const paymentAmount = parseFloat(data.amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            throw new Error("Payment amount must be positive");
        }
        const targetFlatId = data.flatId || data.roomId;
        const targetResidentId = data.residentId || data.stayId;
        let targetUserId = data.userId;
        if (!targetUserId && targetResidentId) {
            const rList = await index_js_1.db
                .select({ userId: index_js_2.residents.userId })
                .from(index_js_2.residents)
                .where((0, drizzle_orm_1.eq)(index_js_2.residents.id, targetResidentId))
                .limit(1);
            if (rList.length > 0 && rList[0].userId) {
                targetUserId = rList[0].userId;
            }
        }
        if (!targetUserId)
            targetUserId = createdByUserId;
        let previousPending = 0;
        let targetMaintenanceBill = null;
        if (data.maintenanceBillId) {
            const bill = await index_js_1.db
                .select()
                .from(index_js_2.maintenanceBills)
                .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.id, data.maintenanceBillId))
                .limit(1);
            if (bill.length > 0) {
                targetMaintenanceBill = bill[0];
                previousPending = parseFloat(targetMaintenanceBill.pendingAmount);
            }
        }
        else if (targetFlatId) {
            // Try to find matching maintenance bill for flat + month + year
            const bMonth = data.billingMonth || new Date().getMonth() + 1;
            const bYear = data.billingYear || new Date().getFullYear();
            const matched = await index_js_1.db
                .select()
                .from(index_js_2.maintenanceBills)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.flatId, targetFlatId), (0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingMonth, bMonth), (0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.billingYear, bYear)))
                .limit(1);
            if (matched.length > 0) {
                targetMaintenanceBill = matched[0];
                previousPending = parseFloat(targetMaintenanceBill.pendingAmount);
            }
            else {
                const flatBills = await index_js_1.db
                    .select()
                    .from(index_js_2.maintenanceBills)
                    .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.flatId, targetFlatId));
                previousPending = flatBills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
            }
        }
        else if (targetUserId) {
            const userBills = await index_js_1.db
                .select()
                .from(index_js_2.monthlyBills)
                .where((0, drizzle_orm_1.eq)(index_js_2.monthlyBills.userId, targetUserId));
            previousPending = userBills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
        }
        const remainingPending = Math.max(0, previousPending - paymentAmount);
        const receiptNumber = (0, receipt_js_1.generateReceiptNumber)();
        const insertPayload = {
            societyId: data.societyId || 1,
            flatId: targetFlatId || null,
            residentId: targetResidentId || null,
            roomId: data.roomId || targetFlatId || null,
            stayId: data.stayId || targetResidentId || null,
            userId: targetUserId,
            maintenanceBillId: targetMaintenanceBill ? targetMaintenanceBill.id : (data.maintenanceBillId || null),
            monthlyBillId: data.monthlyBillId || null,
            billingMonth: data.billingMonth || new Date().getMonth() + 1,
            billingYear: data.billingYear || new Date().getFullYear(),
            amount: paymentAmount.toFixed(2),
            paymentDate: data.paymentDate || new Date().toISOString().slice(0, 10),
            paymentMethod: data.paymentMethod || "CASH",
            transactionId: data.transactionId ? data.transactionId.trim() : null,
            receiptNumber,
            status: "PAID",
            previousPending: previousPending.toFixed(2),
            remainingPending: remainingPending.toFixed(2),
            remarks: data.remarks || null,
            createdBy: createdByUserId,
        };
        const res = await index_js_1.db.insert(index_js_2.payments).values(insertPayload);
        const paymentId = res[0].insertId;
        // If linked to maintenance bill, update bill paid and pending
        if (targetMaintenanceBill) {
            const newPaid = parseFloat(targetMaintenanceBill.paidAmount) + paymentAmount;
            const newPending = Math.max(0, parseFloat(targetMaintenanceBill.totalAmount) - newPaid);
            const newStatus = newPending <= 0 ? "PAID" : "PARTIAL";
            await index_js_1.db
                .update(index_js_2.maintenanceBills)
                .set({
                paidAmount: newPaid.toFixed(2),
                pendingAmount: newPending.toFixed(2),
                status: newStatus,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.id, targetMaintenanceBill.id));
            await index_js_1.db.insert(index_js_2.paymentAllocations).values({
                paymentId,
                maintenanceBillId: targetMaintenanceBill.id,
                allocatedAmount: paymentAmount.toFixed(2),
            });
        }
        await index_js_1.db.insert(index_js_2.auditLogs).values({
            userId: createdByUserId,
            action: "RECORD_PAYMENT",
            module: "PAYMENTS",
            recordId: paymentId,
            newData: JSON.stringify({ amount: paymentAmount, receiptNumber, flatId: targetFlatId }),
        });
        return this.getPaymentById(paymentId);
    }
    static async updatePayment(id, data) {
        const existing = await index_js_1.db.select().from(index_js_2.payments).where((0, drizzle_orm_1.eq)(index_js_2.payments.id, id)).limit(1);
        if (existing.length === 0)
            throw new Error("Payment record not found");
        const payload = { updatedAt: new Date() };
        if (data.paymentMethod !== undefined)
            payload.paymentMethod = data.paymentMethod;
        if (data.transactionId !== undefined)
            payload.transactionId = data.transactionId;
        if (data.remarks !== undefined)
            payload.remarks = data.remarks;
        if (data.status !== undefined)
            payload.status = data.status;
        await index_js_1.db.update(index_js_2.payments).set(payload).where((0, drizzle_orm_1.eq)(index_js_2.payments.id, id));
        return this.getPaymentById(id);
    }
    static async deletePayment(id) {
        const existing = await index_js_1.db.select().from(index_js_2.payments).where((0, drizzle_orm_1.eq)(index_js_2.payments.id, id)).limit(1);
        if (existing.length === 0)
            throw new Error("Payment record not found");
        const payment = existing[0];
        if (payment.maintenanceBillId) {
            const bill = await index_js_1.db
                .select()
                .from(index_js_2.maintenanceBills)
                .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.id, payment.maintenanceBillId))
                .limit(1);
            if (bill.length > 0) {
                const paidAmount = Math.max(0, parseFloat(bill[0].paidAmount) - parseFloat(payment.amount));
                const totalAmount = parseFloat(bill[0].totalAmount);
                const pendingAmount = Math.max(0, totalAmount - paidAmount);
                let status = "UNPAID";
                if (paidAmount >= totalAmount)
                    status = "PAID";
                else if (paidAmount > 0)
                    status = "PARTIAL";
                await index_js_1.db
                    .update(index_js_2.maintenanceBills)
                    .set({
                    paidAmount: paidAmount.toFixed(2),
                    pendingAmount: pendingAmount.toFixed(2),
                    status,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(index_js_2.maintenanceBills.id, bill[0].id));
            }
        }
        await index_js_1.db.delete(index_js_2.payments).where((0, drizzle_orm_1.eq)(index_js_2.payments.id, id));
        return { success: true, message: "Payment transaction deleted successfully" };
    }
}
exports.PaymentService = PaymentService;
