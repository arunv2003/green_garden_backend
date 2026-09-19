"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
const index_js_3 = require("../../config/index.js");
class BillService {
    static async getAllBills(filters) {
        let query = index_js_1.db
            .select({
            id: index_js_2.monthlyBills.id,
            stayId: index_js_2.monthlyBills.stayId,
            userId: index_js_2.monthlyBills.userId,
            userName: index_js_2.users.name,
            userMobile: index_js_2.users.mobile,
            roomId: index_js_2.monthlyBills.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            floor: index_js_2.rooms.floor,
            billingMonth: index_js_2.monthlyBills.billingMonth,
            billingYear: index_js_2.monthlyBills.billingYear,
            billAmount: index_js_2.monthlyBills.billAmount,
            paidAmount: index_js_2.monthlyBills.paidAmount,
            pendingAmount: index_js_2.monthlyBills.pendingAmount,
            dueDate: index_js_2.monthlyBills.dueDate,
            status: index_js_2.monthlyBills.status,
            isProrated: index_js_2.monthlyBills.isProrated,
            proratedDays: index_js_2.monthlyBills.proratedDays,
            remarks: index_js_2.monthlyBills.remarks,
            createdAt: index_js_2.monthlyBills.createdAt,
        })
            .from(index_js_2.monthlyBills)
            .innerJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.monthlyBills.userId, index_js_2.users.id))
            .innerJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.monthlyBills.roomId, index_js_2.rooms.id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.monthlyBills.billingYear), (0, drizzle_orm_1.desc)(index_js_2.monthlyBills.billingMonth), index_js_2.rooms.roomNumber);
        const bills = await query;
        return bills.filter((b) => {
            if (filters?.month && b.billingMonth !== filters.month)
                return false;
            if (filters?.year && b.billingYear !== filters.year)
                return false;
            if (filters?.status && b.status !== filters.status)
                return false;
            if (filters?.userId && b.userId !== filters.userId)
                return false;
            if (filters?.roomId && b.roomId !== filters.roomId)
                return false;
            return true;
        });
    }
    static async getBillById(id) {
        const records = await index_js_1.db
            .select({
            id: index_js_2.monthlyBills.id,
            stayId: index_js_2.monthlyBills.stayId,
            userId: index_js_2.monthlyBills.userId,
            userName: index_js_2.users.name,
            userMobile: index_js_2.users.mobile,
            roomId: index_js_2.monthlyBills.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            billingMonth: index_js_2.monthlyBills.billingMonth,
            billingYear: index_js_2.monthlyBills.billingYear,
            billAmount: index_js_2.monthlyBills.billAmount,
            paidAmount: index_js_2.monthlyBills.paidAmount,
            pendingAmount: index_js_2.monthlyBills.pendingAmount,
            dueDate: index_js_2.monthlyBills.dueDate,
            status: index_js_2.monthlyBills.status,
            isProrated: index_js_2.monthlyBills.isProrated,
            proratedDays: index_js_2.monthlyBills.proratedDays,
            remarks: index_js_2.monthlyBills.remarks,
            createdAt: index_js_2.monthlyBills.createdAt,
        })
            .from(index_js_2.monthlyBills)
            .innerJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.monthlyBills.userId, index_js_2.users.id))
            .innerJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.monthlyBills.roomId, index_js_2.rooms.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.monthlyBills.id, id))
            .limit(1);
        if (records.length === 0) {
            throw new Error("Bill not found");
        }
        return records[0];
    }
    static async generateMonthlyBills(month, year, inputDueDate) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const monthStartStr = `${year}-${String(month).padStart(2, "0")}-01`;
        const monthEndStr = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
        const defaultDueDate = inputDueDate ||
            `${year}-${String(month).padStart(2, "0")}-${String(Math.min(10, daysInMonth)).padStart(2, "0")}`;
        // Active stays during this billing month
        const activeStays = await index_js_1.db
            .select()
            .from(index_js_2.stays)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${index_js_2.stays.checkInDate} <= ${monthEndStr}`, (0, drizzle_orm_1.sql) `(${index_js_2.stays.checkOutDate} IS NULL OR ${index_js_2.stays.checkOutDate} >= ${monthStartStr})`));
        let generatedCount = 0;
        const generatedBills = [];
        for (const stay of activeStays) {
            // Check if bill already exists
            const existing = await index_js_1.db
                .select()
                .from(index_js_2.monthlyBills)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.monthlyBills.stayId, stay.id), (0, drizzle_orm_1.eq)(index_js_2.monthlyBills.billingMonth, month), (0, drizzle_orm_1.eq)(index_js_2.monthlyBills.billingYear, year)))
                .limit(1);
            if (existing.length > 0) {
                continue;
            }
            const rent = parseFloat(stay.monthlyRent);
            const checkInDate = new Date(stay.checkInDate);
            const checkInMonth = checkInDate.getMonth() + 1;
            const checkInYear = checkInDate.getFullYear();
            const checkInDay = checkInDate.getDate();
            let billAmount = rent;
            let isProrated = false;
            let proratedDays = daysInMonth;
            // Check if checked in mid-month
            if (checkInYear === year && checkInMonth === month && checkInDay > 1) {
                if (index_js_3.config.billingMode === "DAILY_PRORATED") {
                    proratedDays = daysInMonth - checkInDay + 1;
                    billAmount = Math.round((rent / daysInMonth) * proratedDays);
                    isProrated = true;
                }
            }
            // Check if checkout happened during this month
            if (stay.checkOutDate) {
                const checkOutDate = new Date(stay.checkOutDate);
                const checkOutMonth = checkOutDate.getMonth() + 1;
                const checkOutYear = checkOutDate.getFullYear();
                const checkOutDay = checkOutDate.getDate();
                if (checkOutYear === year && checkOutMonth === month && checkOutDay < daysInMonth) {
                    if (index_js_3.config.billingMode === "DAILY_PRORATED") {
                        const startDay = (checkInYear === year && checkInMonth === month) ? checkInDay : 1;
                        proratedDays = checkOutDay - startDay + 1;
                        billAmount = Math.round((rent / daysInMonth) * proratedDays);
                        isProrated = true;
                    }
                }
            }
            const insertResult = await index_js_1.db.insert(index_js_2.monthlyBills).values({
                stayId: stay.id,
                userId: stay.userId,
                roomId: stay.roomId,
                billingMonth: month,
                billingYear: year,
                billAmount: billAmount.toString(),
                paidAmount: "0.00",
                pendingAmount: billAmount.toString(),
                dueDate: defaultDueDate,
                status: "PENDING",
                isProrated,
                proratedDays: isProrated ? proratedDays : null,
                remarks: isProrated ? `Prorated for ${proratedDays} days` : `Monthly rent for ${month}/${year}`,
            });
            generatedCount++;
            generatedBills.push({
                id: insertResult[0].insertId,
                stayId: stay.id,
                userId: stay.userId,
                billAmount,
                isProrated,
            });
        }
        return {
            message: `Successfully generated ${generatedCount} monthly bills for ${month}/${year}`,
            generatedCount,
            bills: generatedBills,
        };
    }
}
exports.BillService = BillService;
