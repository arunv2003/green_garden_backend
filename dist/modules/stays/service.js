"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StayService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
const service_js_1 = require("../rooms/service.js");
const index_js_3 = require("../../config/index.js");
class StayService {
    static async getAllStays(filters) {
        let query = index_js_1.db
            .select({
            id: index_js_2.stays.id,
            userId: index_js_2.stays.userId,
            userName: index_js_2.users.name,
            userMobile: index_js_2.users.mobile,
            userEmail: index_js_2.users.email,
            roomId: index_js_2.stays.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            floor: index_js_2.rooms.floor,
            roomType: index_js_2.rooms.roomType,
            checkInDate: index_js_2.stays.checkInDate,
            checkInTime: index_js_2.stays.checkInTime,
            checkOutDate: index_js_2.stays.checkOutDate,
            checkOutTime: index_js_2.stays.checkOutTime,
            monthlyRent: index_js_2.stays.monthlyRent,
            securityDeposit: index_js_2.stays.securityDeposit,
            initialPending: index_js_2.stays.initialPending,
            finalPending: index_js_2.stays.finalPending,
            status: index_js_2.stays.status,
            checkOutReason: index_js_2.stays.checkOutReason,
            remarks: index_js_2.stays.remarks,
            createdAt: index_js_2.stays.createdAt,
        })
            .from(index_js_2.stays)
            .innerJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.stays.userId, index_js_2.users.id))
            .innerJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.stays.roomId, index_js_2.rooms.id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.stays.createdAt));
        const allStays = await query;
        const filtered = allStays.filter((s) => {
            if (filters?.status && filters.status !== "ALL" && s.status !== filters.status)
                return false;
            if (filters?.userId && s.userId !== filters.userId)
                return false;
            if (filters?.roomId && s.roomId !== filters.roomId)
                return false;
            if (filters?.search) {
                const q = filters.search.toLowerCase().trim();
                const matches = s.userName?.toLowerCase().includes(q) ||
                    s.roomNumber?.toLowerCase().includes(q) ||
                    s.userMobile?.includes(q) ||
                    (s.userEmail && s.userEmail.toLowerCase().includes(q));
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
        return {
            items,
            meta: {
                total,
                page,
                limit: filters?.limit || total,
                totalPages: filters?.limit ? Math.ceil(total / limit) || 1 : 1,
            },
        };
    }
    static async getStayById(id) {
        const records = await index_js_1.db
            .select({
            id: index_js_2.stays.id,
            userId: index_js_2.stays.userId,
            userName: index_js_2.users.name,
            userMobile: index_js_2.users.mobile,
            userEmail: index_js_2.users.email,
            roomId: index_js_2.stays.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            floor: index_js_2.rooms.floor,
            roomType: index_js_2.rooms.roomType,
            checkInDate: index_js_2.stays.checkInDate,
            checkInTime: index_js_2.stays.checkInTime,
            checkOutDate: index_js_2.stays.checkOutDate,
            checkOutTime: index_js_2.stays.checkOutTime,
            monthlyRent: index_js_2.stays.monthlyRent,
            securityDeposit: index_js_2.stays.securityDeposit,
            initialPending: index_js_2.stays.initialPending,
            finalPending: index_js_2.stays.finalPending,
            status: index_js_2.stays.status,
            checkOutReason: index_js_2.stays.checkOutReason,
            remarks: index_js_2.stays.remarks,
            startingMeter: index_js_2.stays.startingMeter,
            createdAt: index_js_2.stays.createdAt,
        })
            .from(index_js_2.stays)
            .innerJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.stays.userId, index_js_2.users.id))
            .innerJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.stays.roomId, index_js_2.rooms.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.stays.id, id))
            .limit(1);
        if (records.length === 0) {
            throw new Error("Stay record not found");
        }
        return records[0];
    }
    static async checkIn(data, createdByUserId) {
        // 1. Check if user already has an active stay
        const existingActiveStay = await index_js_1.db
            .select()
            .from(index_js_2.stays)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.userId, data.userId), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE")))
            .limit(1);
        if (existingActiveStay.length > 0) {
            throw new Error("User already has an active stay in another room. Check out from the previous room first.");
        }
        // 2. Check room capacity
        const roomRecords = await index_js_1.db
            .select()
            .from(index_js_2.rooms)
            .where((0, drizzle_orm_1.eq)(index_js_2.rooms.id, data.roomId))
            .limit(1);
        if (roomRecords.length === 0) {
            throw new Error("Room not found");
        }
        const room = roomRecords[0];
        if (room.status === "MAINTENANCE" || room.status === "INACTIVE") {
            throw new Error(`Room is currently under ${room.status.toLowerCase()} and cannot be assigned`);
        }
        const currentOccupants = await index_js_1.db
            .select()
            .from(index_js_2.stays)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.roomId, data.roomId), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE")));
        if (currentOccupants.length >= room.capacity) {
            throw new Error(`Room ${room.roomNumber} has reached maximum capacity (${room.capacity} occupants)`);
        }
        // 3. Compute initial bill and prorated amount
        const checkInDateObj = new Date(data.checkInDate);
        const billingMonth = checkInDateObj.getMonth() + 1; // 1-12
        const billingYear = checkInDateObj.getFullYear();
        const daysInMonth = new Date(billingYear, billingMonth, 0).getDate();
        const dayOfMonth = checkInDateObj.getDate();
        let initialBillAmount = data.monthlyRent;
        let isProrated = false;
        let proratedDays = daysInMonth;
        if (index_js_3.config.billingMode === "DAILY_PRORATED" && dayOfMonth > 1) {
            proratedDays = daysInMonth - dayOfMonth + 1;
            initialBillAmount = Math.round((data.monthlyRent / daysInMonth) * proratedDays);
            isProrated = true;
        }
        // 4. Create Stay record
        const insertStay = await index_js_1.db.insert(index_js_2.stays).values({
            userId: data.userId,
            roomId: data.roomId,
            checkInDate: data.checkInDate,
            checkInTime: data.checkInTime || "10:00:00",
            monthlyRent: data.monthlyRent.toString(),
            securityDeposit: (data.securityDeposit || 0).toString(),
            initialPending: initialBillAmount.toString(),
            status: "ACTIVE",
            remarks: data.remarks || null,
            startingMeter: data.startingMeter || null,
            createdBy: createdByUserId || null,
        });
        const stayId = insertStay[0].insertId;
        // 5. Generate initial monthly bill
        const dueDate = new Date(billingYear, billingMonth - 1, Math.min(10, daysInMonth))
            .toISOString()
            .split("T")[0];
        await index_js_1.db.insert(index_js_2.monthlyBills).values({
            stayId,
            userId: data.userId,
            roomId: data.roomId,
            billingMonth,
            billingYear,
            billAmount: initialBillAmount.toString(),
            paidAmount: "0.00",
            pendingAmount: initialBillAmount.toString(),
            dueDate,
            status: "PENDING",
            isProrated,
            proratedDays: isProrated ? proratedDays : null,
            remarks: isProrated
                ? `Prorated initial bill for ${proratedDays} days (checked in on ${data.checkInDate})`
                : "Initial monthly rent bill",
        });
        // 6. Update room status
        await service_js_1.RoomService.updateRoomStatus(data.roomId);
        // 7. Audit log
        await index_js_1.db.insert(index_js_2.auditLogs).values({
            userId: createdByUserId || null,
            action: "CHECK_IN",
            module: "STAYS",
            recordId: stayId,
            newData: JSON.stringify({
                stayId,
                userId: data.userId,
                roomId: data.roomId,
                checkInDate: data.checkInDate,
                initialBillAmount,
            }),
        });
        return this.getStayById(stayId);
    }
    static async checkOut(stayId, data, checkedOutByUserId) {
        const stayRecords = await index_js_1.db
            .select()
            .from(index_js_2.stays)
            .where((0, drizzle_orm_1.eq)(index_js_2.stays.id, stayId))
            .limit(1);
        if (stayRecords.length === 0) {
            throw new Error("Stay record not found");
        }
        const stay = stayRecords[0];
        if (stay.status !== "ACTIVE") {
            throw new Error("Stay is not active");
        }
        // Calculate final pending balance
        const userBills = await index_js_1.db
            .select()
            .from(index_js_2.monthlyBills)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.monthlyBills.stayId, stayId), (0, drizzle_orm_1.eq)(index_js_2.monthlyBills.userId, stay.userId)));
        const totalPending = userBills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
        // Update Stay to COMPLETED
        await index_js_1.db
            .update(index_js_2.stays)
            .set({
            status: "COMPLETED",
            checkOutDate: data.checkOutDate,
            checkOutTime: data.checkOutTime || "12:00:00",
            checkOutReason: data.checkOutReason || "Normal Checkout",
            finalPending: totalPending.toString(),
            securityDepositAdjustment: (data.securityDepositAdjustment || 0).toString(),
            remarks: data.remarks || stay.remarks,
            checkedOutBy: checkedOutByUserId || null,
        })
            .where((0, drizzle_orm_1.eq)(index_js_2.stays.id, stayId));
        // Update Room status
        await service_js_1.RoomService.updateRoomStatus(stay.roomId);
        // Audit log
        await index_js_1.db.insert(index_js_2.auditLogs).values({
            userId: checkedOutByUserId || null,
            action: "CHECK_OUT",
            module: "STAYS",
            recordId: stayId,
            newData: JSON.stringify({
                stayId,
                checkOutDate: data.checkOutDate,
                finalPending: totalPending,
            }),
        });
        return this.getStayById(stayId);
    }
    static async updateStay(stayId, data) {
        const existing = await index_js_1.db.select().from(index_js_2.stays).where((0, drizzle_orm_1.eq)(index_js_2.stays.id, stayId)).limit(1);
        if (existing.length === 0)
            throw new Error("Stay record not found");
        const payload = {};
        if (data.monthlyRent !== undefined)
            payload.monthlyRent = data.monthlyRent.toString();
        if (data.checkInDate !== undefined)
            payload.checkInDate = data.checkInDate;
        if (data.checkOutDate !== undefined)
            payload.checkOutDate = data.checkOutDate;
        if (data.status !== undefined)
            payload.status = data.status;
        if (data.remarks !== undefined)
            payload.remarks = data.remarks;
        await index_js_1.db.update(index_js_2.stays).set(payload).where((0, drizzle_orm_1.eq)(index_js_2.stays.id, stayId));
        if (existing[0].roomId) {
            await service_js_1.RoomService.updateRoomStatus(existing[0].roomId);
        }
        return this.getStayById(stayId);
    }
    static async deleteStay(stayId) {
        const existing = await index_js_1.db.select().from(index_js_2.stays).where((0, drizzle_orm_1.eq)(index_js_2.stays.id, stayId)).limit(1);
        if (existing.length === 0)
            throw new Error("Stay record not found");
        const roomId = existing[0].roomId;
        await index_js_1.db.delete(index_js_2.stays).where((0, drizzle_orm_1.eq)(index_js_2.stays.id, stayId));
        if (roomId) {
            await service_js_1.RoomService.updateRoomStatus(roomId);
        }
        return { success: true, message: "Stay record deleted successfully" };
    }
}
exports.StayService = StayService;
