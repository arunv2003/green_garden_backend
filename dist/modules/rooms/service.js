"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class RoomService {
    static async getAllRooms(filters) {
        let conditions = [(0, drizzle_orm_1.isNull)(index_js_2.rooms.deletedAt)];
        if (filters?.floor !== undefined && !isNaN(filters.floor)) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.rooms.floor, filters.floor));
        }
        if (filters?.roomType && filters.roomType !== "ALL") {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.rooms.roomType, filters.roomType));
        }
        const allRooms = await index_js_1.db
            .select()
            .from(index_js_2.rooms)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(index_js_2.rooms.roomNumber);
        // Enrich rooms with active occupant counts and details
        const activeStays = await index_js_1.db
            .select({
            stayId: index_js_2.stays.id,
            roomId: index_js_2.stays.roomId,
            userId: index_js_2.stays.userId,
            userName: index_js_2.users.name,
            userMobile: index_js_2.users.mobile,
            userEmail: index_js_2.users.email,
            checkInDate: index_js_2.stays.checkInDate,
            checkInTime: index_js_2.stays.checkInTime,
            monthlyRent: index_js_2.stays.monthlyRent,
        })
            .from(index_js_2.stays)
            .innerJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.stays.userId, index_js_2.users.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE"));
        const stayMap = new Map();
        activeStays.forEach((s) => {
            const list = stayMap.get(s.roomId) || [];
            list.push(s);
            stayMap.set(s.roomId, list);
        });
        let enriched = allRooms.map((r) => {
            const occupants = stayMap.get(r.id) || [];
            let calculatedStatus = r.status;
            if (r.status !== "MAINTENANCE" && r.status !== "INACTIVE") {
                if (occupants.length === 0) {
                    calculatedStatus = "AVAILABLE";
                }
                else if (occupants.length >= r.capacity) {
                    calculatedStatus = "OCCUPIED";
                }
                else {
                    calculatedStatus = "PARTIALLY_OCCUPIED";
                }
            }
            return {
                ...r,
                calculatedStatus,
                activeOccupantsCount: occupants.length,
                availableSlots: Math.max(0, r.capacity - occupants.length),
                currentResidents: occupants,
            };
        });
        if (filters?.status && filters.status !== "ALL") {
            enriched = enriched.filter((r) => r.calculatedStatus === filters.status || r.status === filters.status);
        }
        if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            enriched = enriched.filter((r) => r.roomNumber.toLowerCase().includes(q) ||
                r.roomType.toLowerCase().includes(q) ||
                (r.description && r.description.toLowerCase().includes(q)) ||
                r.currentResidents.some((res) => res.userName?.toLowerCase().includes(q) ||
                    res.userMobile?.includes(q)));
        }
        const total = enriched.length;
        let items = enriched;
        const page = filters?.page ? Math.max(1, filters.page) : 1;
        const limit = filters?.limit ? Math.max(1, filters.limit) : total;
        if (filters?.page && filters?.limit) {
            const offset = (page - 1) * limit;
            items = enriched.slice(offset, offset + limit);
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
    static async getRoomById(id) {
        const roomRecords = await index_js_1.db
            .select()
            .from(index_js_2.rooms)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.rooms.id, id), (0, drizzle_orm_1.isNull)(index_js_2.rooms.deletedAt)))
            .limit(1);
        if (roomRecords.length === 0) {
            throw new Error("Room not found");
        }
        const room = roomRecords[0];
        // Current residents
        const currentResidents = await index_js_1.db
            .select({
            stayId: index_js_2.stays.id,
            userId: index_js_2.users.id,
            name: index_js_2.users.name,
            email: index_js_2.users.email,
            mobile: index_js_2.users.mobile,
            checkInDate: index_js_2.stays.checkInDate,
            checkInTime: index_js_2.stays.checkInTime,
            monthlyRent: index_js_2.stays.monthlyRent,
            securityDeposit: index_js_2.stays.securityDeposit,
        })
            .from(index_js_2.stays)
            .innerJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.stays.userId, index_js_2.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.roomId, id), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE")));
        // Previous residents
        const previousResidents = await index_js_1.db
            .select({
            stayId: index_js_2.stays.id,
            userId: index_js_2.users.id,
            name: index_js_2.users.name,
            email: index_js_2.users.email,
            mobile: index_js_2.users.mobile,
            checkInDate: index_js_2.stays.checkInDate,
            checkInTime: index_js_2.stays.checkInTime,
            checkOutDate: index_js_2.stays.checkOutDate,
            checkOutTime: index_js_2.stays.checkOutTime,
            checkOutReason: index_js_2.stays.checkOutReason,
            monthlyRent: index_js_2.stays.monthlyRent,
        })
            .from(index_js_2.stays)
            .innerJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.stays.userId, index_js_2.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.roomId, id), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "COMPLETED")))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.stays.checkOutDate));
        // Payment summary for this room
        const roomPayments = await index_js_1.db
            .select({
            id: index_js_2.payments.id,
            amount: index_js_2.payments.amount,
            paymentDate: index_js_2.payments.paymentDate,
            paymentMethod: index_js_2.payments.paymentMethod,
            receiptNumber: index_js_2.payments.receiptNumber,
            billingMonth: index_js_2.payments.billingMonth,
            billingYear: index_js_2.payments.billingYear,
            userName: index_js_2.users.name,
        })
            .from(index_js_2.payments)
            .innerJoin(index_js_2.users, (0, drizzle_orm_1.eq)(index_js_2.payments.userId, index_js_2.users.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.payments.roomId, id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.payments.paymentDate))
            .limit(20);
        const totalRevenueResult = await index_js_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.payments.amount}), 0)`,
        })
            .from(index_js_2.payments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.payments.roomId, id), (0, drizzle_orm_1.eq)(index_js_2.payments.status, "PAID")));
        const totalRevenue = parseFloat(totalRevenueResult[0]?.total || "0");
        return {
            ...room,
            activeOccupantsCount: currentResidents.length,
            availableSlots: Math.max(0, room.capacity - currentResidents.length),
            currentResidents,
            previousResidents,
            totalRevenue,
            recentPayments: roomPayments,
        };
    }
    static async createRoom(data) {
        const existing = await index_js_1.db
            .select()
            .from(index_js_2.rooms)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.rooms.roomNumber, data.roomNumber), (0, drizzle_orm_1.isNull)(index_js_2.rooms.deletedAt)))
            .limit(1);
        if (existing.length > 0) {
            throw new Error(`Room number '${data.roomNumber}' already exists`);
        }
        const insertResult = await index_js_1.db.insert(index_js_2.rooms).values({
            roomNumber: data.roomNumber,
            floor: data.floor,
            roomType: data.roomType,
            capacity: data.capacity,
            monthlyRent: data.monthlyRent.toString(),
            securityDeposit: (data.securityDeposit || 0).toString(),
            description: data.description || null,
            status: data.status || "AVAILABLE",
        });
        return { id: insertResult[0].insertId, ...data };
    }
    static async updateRoom(id, data) {
        const existing = await index_js_1.db
            .select()
            .from(index_js_2.rooms)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.rooms.id, id), (0, drizzle_orm_1.isNull)(index_js_2.rooms.deletedAt)))
            .limit(1);
        if (existing.length === 0) {
            throw new Error("Room not found");
        }
        if (data.roomNumber && data.roomNumber !== existing[0].roomNumber) {
            const duplicate = await index_js_1.db
                .select()
                .from(index_js_2.rooms)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.rooms.roomNumber, data.roomNumber), (0, drizzle_orm_1.isNull)(index_js_2.rooms.deletedAt)))
                .limit(1);
            if (duplicate.length > 0) {
                throw new Error(`Room number '${data.roomNumber}' already exists`);
            }
        }
        const updatePayload = { ...data };
        if (data.monthlyRent !== undefined) {
            updatePayload.monthlyRent = data.monthlyRent.toString();
        }
        if (data.securityDeposit !== undefined) {
            updatePayload.securityDeposit = data.securityDeposit.toString();
        }
        await index_js_1.db.update(index_js_2.rooms).set(updatePayload).where((0, drizzle_orm_1.eq)(index_js_2.rooms.id, id));
        return this.getRoomById(id);
    }
    static async deleteRoom(id) {
        // Check if active stays exist
        const activeStays = await index_js_1.db
            .select()
            .from(index_js_2.stays)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.roomId, id), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE")));
        if (activeStays.length > 0) {
            throw new Error("Cannot delete room with active residents. Check out residents first.");
        }
        await index_js_1.db
            .update(index_js_2.rooms)
            .set({ deletedAt: new Date(), status: "INACTIVE" })
            .where((0, drizzle_orm_1.eq)(index_js_2.rooms.id, id));
        return { success: true, message: "Room soft-deleted successfully" };
    }
    static async updateRoomStatus(roomId) {
        const roomData = await index_js_1.db
            .select()
            .from(index_js_2.rooms)
            .where((0, drizzle_orm_1.eq)(index_js_2.rooms.id, roomId))
            .limit(1);
        if (roomData.length === 0)
            return;
        const room = roomData[0];
        if (room.status === "MAINTENANCE" || room.status === "INACTIVE")
            return;
        const activeResidents = await index_js_1.db
            .select()
            .from(index_js_2.stays)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.roomId, roomId), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE")));
        let newStatus = "AVAILABLE";
        if (activeResidents.length >= room.capacity) {
            newStatus = "OCCUPIED";
        }
        else if (activeResidents.length > 0) {
            newStatus = "PARTIALLY_OCCUPIED";
        }
        await index_js_1.db.update(index_js_2.rooms).set({ status: newStatus }).where((0, drizzle_orm_1.eq)(index_js_2.rooms.id, roomId));
    }
}
exports.RoomService = RoomService;
