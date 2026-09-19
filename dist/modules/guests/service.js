"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
const hash_js_1 = require("../../utils/hash.js");
class GuestService {
    static async getAllGuests(filters) {
        let conditions = [(0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)];
        if (filters?.role) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.users.role, filters.role));
        }
        else {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.users.role, "USER"));
        }
        if (filters?.status) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_2.users.status, filters.status));
        }
        const allGuests = await index_js_1.db
            .select()
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(index_js_2.users.name);
        // Enrich with active stays and financial summary
        const activeStays = await index_js_1.db
            .select({
            stayId: index_js_2.stays.id,
            userId: index_js_2.stays.userId,
            roomId: index_js_2.stays.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            floor: index_js_2.rooms.floor,
            checkInDate: index_js_2.stays.checkInDate,
            checkInTime: index_js_2.stays.checkInTime,
            monthlyRent: index_js_2.stays.monthlyRent,
        })
            .from(index_js_2.stays)
            .innerJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.stays.roomId, index_js_2.rooms.id))
            .where((0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE"));
        const stayMap = new Map();
        activeStays.forEach((s) => stayMap.set(s.userId, s));
        // Pending sums
        const pendingSums = await index_js_1.db
            .select({
            userId: index_js_2.monthlyBills.userId,
            totalPending: (0, drizzle_orm_1.sql) `COALESCE(SUM(${index_js_2.monthlyBills.pendingAmount}), 0)`,
        })
            .from(index_js_2.monthlyBills)
            .groupBy(index_js_2.monthlyBills.userId);
        const pendingMap = new Map();
        pendingSums.forEach((p) => pendingMap.set(p.userId, parseFloat(p.totalPending)));
        let enriched = allGuests.map((g) => {
            const { password: _, ...guestInfo } = g;
            const activeStay = stayMap.get(g.id);
            return {
                ...guestInfo,
                activeStay: activeStay || null,
                currentRoomNumber: activeStay?.roomNumber || null,
                totalPendingAmount: pendingMap.get(g.id) || 0,
            };
        });
        if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            enriched = enriched.filter((g) => {
                return (g.name?.toLowerCase().includes(q) ||
                    g.email?.toLowerCase().includes(q) ||
                    g.mobile?.includes(q) ||
                    (g.currentRoomNumber && g.currentRoomNumber.toLowerCase().includes(q)));
            });
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
    static async getGuestById(id) {
        const userRecords = await index_js_1.db
            .select()
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.users.id, id), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)))
            .limit(1);
        if (userRecords.length === 0) {
            throw new Error("Guest not found");
        }
        const { password: _, ...guest } = userRecords[0];
        // Current stay
        const currentStayList = await index_js_1.db
            .select({
            id: index_js_2.stays.id,
            roomId: index_js_2.stays.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            roomType: index_js_2.rooms.roomType,
            floor: index_js_2.rooms.floor,
            checkInDate: index_js_2.stays.checkInDate,
            checkInTime: index_js_2.stays.checkInTime,
            monthlyRent: index_js_2.stays.monthlyRent,
            securityDeposit: index_js_2.stays.securityDeposit,
            status: index_js_2.stays.status,
            startingMeter: index_js_2.stays.startingMeter,
            remarks: index_js_2.stays.remarks,
        })
            .from(index_js_2.stays)
            .innerJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.stays.roomId, index_js_2.rooms.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.userId, id), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE")))
            .limit(1);
        const currentStay = currentStayList[0] || null;
        // Previous stays
        const previousStays = await index_js_1.db
            .select({
            id: index_js_2.stays.id,
            roomId: index_js_2.stays.roomId,
            roomNumber: index_js_2.rooms.roomNumber,
            roomType: index_js_2.rooms.roomType,
            floor: index_js_2.rooms.floor,
            checkInDate: index_js_2.stays.checkInDate,
            checkInTime: index_js_2.stays.checkInTime,
            checkOutDate: index_js_2.stays.checkOutDate,
            checkOutTime: index_js_2.stays.checkOutTime,
            checkOutReason: index_js_2.stays.checkOutReason,
            monthlyRent: index_js_2.stays.monthlyRent,
            securityDeposit: index_js_2.stays.securityDeposit,
            status: index_js_2.stays.status,
        })
            .from(index_js_2.stays)
            .innerJoin(index_js_2.rooms, (0, drizzle_orm_1.eq)(index_js_2.stays.roomId, index_js_2.rooms.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.userId, id), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "COMPLETED")))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.stays.checkOutDate));
        // Monthly bills
        const bills = await index_js_1.db
            .select({
            id: index_js_2.monthlyBills.id,
            stayId: index_js_2.monthlyBills.stayId,
            billingMonth: index_js_2.monthlyBills.billingMonth,
            billingYear: index_js_2.monthlyBills.billingYear,
            billAmount: index_js_2.monthlyBills.billAmount,
            paidAmount: index_js_2.monthlyBills.paidAmount,
            pendingAmount: index_js_2.monthlyBills.pendingAmount,
            dueDate: index_js_2.monthlyBills.dueDate,
            status: index_js_2.monthlyBills.status,
            isProrated: index_js_2.monthlyBills.isProrated,
        })
            .from(index_js_2.monthlyBills)
            .where((0, drizzle_orm_1.eq)(index_js_2.monthlyBills.userId, id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.monthlyBills.billingYear), (0, drizzle_orm_1.desc)(index_js_2.monthlyBills.billingMonth));
        // Payments
        const guestPayments = await index_js_1.db
            .select({
            id: index_js_2.payments.id,
            amount: index_js_2.payments.amount,
            paymentDate: index_js_2.payments.paymentDate,
            paymentMethod: index_js_2.payments.paymentMethod,
            transactionId: index_js_2.payments.transactionId,
            receiptNumber: index_js_2.payments.receiptNumber,
            billingMonth: index_js_2.payments.billingMonth,
            billingYear: index_js_2.payments.billingYear,
            status: index_js_2.payments.status,
            remarks: index_js_2.payments.remarks,
        })
            .from(index_js_2.payments)
            .where((0, drizzle_orm_1.eq)(index_js_2.payments.userId, id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.payments.paymentDate));
        const totalBilled = bills.reduce((acc, b) => acc + parseFloat(b.billAmount), 0);
        const totalPaid = guestPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
        const totalPending = bills.reduce((acc, b) => acc + parseFloat(b.pendingAmount), 0);
        return {
            ...guest,
            currentStay,
            previousStays,
            bills,
            payments: guestPayments,
            financialSummary: {
                totalBilled,
                totalPaid,
                totalPending,
            },
        };
    }
    static async createGuest(data) {
        const cleanEmail = (data.email || "").trim();
        const cleanMobile = (data.mobile || "").trim();
        const cleanName = (data.name || "").trim();
        const existing = await index_js_1.db
            .select()
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.users.email, cleanEmail), (0, drizzle_orm_1.eq)(index_js_2.users.mobile, cleanMobile)))
            .limit(1);
        if (existing.length > 0) {
            throw new Error("A user with this email or mobile already exists");
        }
        const role = data.role && ["USER", "SECRETARY", "ACCOUNTANT"].includes(data.role)
            ? data.role
            : "USER";
        let defaultPass = "User@123";
        if (role === "SECRETARY")
            defaultPass = "Secretary@123";
        else if (role === "ACCOUNTANT")
            defaultPass = "Accountant@123";
        const finalPass = data.password && data.password.trim().length >= 6
            ? data.password.trim()
            : defaultPass;
        const hashedPassword = await (0, hash_js_1.hashPassword)(finalPass);
        const joiningDateStr = data.joiningDate
            ? (data.joiningDate.includes("T") ? data.joiningDate.split("T")[0] : data.joiningDate)
            : new Date().toISOString().slice(0, 10);
        const result = await index_js_1.db.insert(index_js_2.users).values({
            name: cleanName,
            email: cleanEmail,
            mobile: cleanMobile,
            password: hashedPassword,
            role: role,
            status: "ACTIVE",
            fatherHusbandName: data.fatherHusbandName ? data.fatherHusbandName.trim() : null,
            address: data.address ? data.address.trim() : null,
            idProofType: data.idProofType || (role === "ACCOUNTANT" ? "PAN Card" : "Aadhaar Card"),
            idProofNumber: data.idProofNumber ? data.idProofNumber.trim() : null,
            emergencyContact: data.emergencyContact ? data.emergencyContact.trim() : null,
            joiningDate: joiningDateStr,
            profilePhoto: data.profilePhoto || null,
            idProofDocument: data.idProofDocument || null,
        });
        return {
            id: result[0].insertId,
            name: cleanName,
            email: cleanEmail,
            mobile: cleanMobile,
            role: role,
            status: "ACTIVE",
        };
    }
    static async updateGuest(id, data) {
        const existing = await index_js_1.db
            .select()
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.users.id, id), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)))
            .limit(1);
        if (existing.length === 0) {
            throw new Error("Guest not found");
        }
        const updatePayload = { ...data };
        if (data.password) {
            updatePayload.password = await (0, hash_js_1.hashPassword)(data.password);
        }
        await index_js_1.db.update(index_js_2.users).set(updatePayload).where((0, drizzle_orm_1.eq)(index_js_2.users.id, id));
        return this.getGuestById(id);
    }
    static async deleteGuest(id) {
        const activeStay = await index_js_1.db
            .select()
            .from(index_js_2.stays)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.stays.userId, id), (0, drizzle_orm_1.eq)(index_js_2.stays.status, "ACTIVE")));
        if (activeStay.length > 0) {
            throw new Error("Cannot delete guest who is currently checked into a room. Please check out first.");
        }
        await index_js_1.db.update(index_js_2.users).set({ deletedAt: new Date(), status: "INACTIVE" }).where((0, drizzle_orm_1.eq)(index_js_2.users.id, id));
        return { success: true, message: "Guest deactivated successfully" };
    }
}
exports.GuestService = GuestService;
