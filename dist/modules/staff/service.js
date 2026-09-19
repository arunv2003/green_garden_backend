"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
const hash_js_1 = require("../../utils/hash.js");
class StaffService {
    /**
     * Get all accountants and secretaries, identifying active secretary
     * Directly from the unified `users` table
     */
    static async getStaffOverview(filters) {
        // 1. Fetch all Staff members (Accountants & Secretaries) from `users` table
        const allStaffMembers = await index_js_1.db
            .select({
            id: index_js_2.users.id,
            name: index_js_2.users.name,
            email: index_js_2.users.email,
            mobile: index_js_2.users.mobile,
            role: index_js_2.users.role,
            status: index_js_2.users.status,
            fatherHusbandName: index_js_2.users.fatherHusbandName,
            address: index_js_2.users.address,
            idProofType: index_js_2.users.idProofType,
            idProofNumber: index_js_2.users.idProofNumber,
            emergencyContact: index_js_2.users.emergencyContact,
            joiningDate: index_js_2.users.joiningDate,
            profilePhoto: index_js_2.users.profilePhoto,
            createdAt: index_js_2.users.createdAt,
            updatedAt: index_js_2.users.updatedAt,
        })
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(index_js_2.users.role, ["SECRETARY", "ACCOUNTANT"]), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)))
            .orderBy((0, drizzle_orm_1.desc)(index_js_2.users.createdAt));
        // 2. Identify Secretaries and active Secretary
        const secretaries = allStaffMembers.filter((s) => s.role === "SECRETARY");
        const activeSecretary = secretaries.find((s) => s.status === "ACTIVE") || secretaries[0] || null;
        let filteredStaff = allStaffMembers;
        if (filters?.role && filters.role !== "ALL") {
            filteredStaff = filteredStaff.filter((s) => s.role === filters.role);
        }
        if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            filteredStaff = filteredStaff.filter((acc) => acc.name.toLowerCase().includes(q) ||
                acc.email.toLowerCase().includes(q) ||
                acc.mobile.includes(q) ||
                acc.role.toLowerCase().includes(q) ||
                (acc.address && acc.address.toLowerCase().includes(q)) ||
                (acc.idProofNumber && acc.idProofNumber.toLowerCase().includes(q)));
        }
        const totalStaff = filteredStaff.length;
        let paginatedStaff = filteredStaff;
        const page = filters?.page ? Math.max(1, filters.page) : 1;
        const limit = filters?.limit ? Math.max(1, filters.limit) : totalStaff;
        if (filters?.page && filters?.limit) {
            const offset = (page - 1) * limit;
            paginatedStaff = filteredStaff.slice(offset, offset + limit);
        }
        return {
            activeSecretary,
            secretaries,
            accountants: paginatedStaff, // all staff members rendered in table
            totalAccountants: allStaffMembers.filter((s) => s.role === "ACCOUNTANT").length,
            totalSecretaries: secretaries.length,
            pagination: {
                total: totalStaff,
                page,
                limit: filters?.limit || totalStaff,
                totalPages: filters?.limit ? Math.ceil(totalStaff / limit) || 1 : 1,
            },
        };
    }
    /**
     * Add a new Staff member (Accountant or Secretary) directly into `users` table
     */
    static async createAccountant(data, creatorId) {
        const existing = await index_js_1.db
            .select()
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.users.email, data.email.trim()), (0, drizzle_orm_1.eq)(index_js_2.users.mobile, data.mobile.trim())))
            .limit(1);
        if (existing.length > 0) {
            throw new Error("A user with this email or mobile number already exists.");
        }
        const targetRole = (data.role === "SECRETARY" ? "SECRETARY" : "ACCOUNTANT");
        const defaultPass = data.password && data.password.trim().length >= 6
            ? data.password.trim()
            : (targetRole === "SECRETARY" ? "Secretary@123" : "Accountant@123");
        const hashedPassword = await (0, hash_js_1.hashPassword)(defaultPass);
        const values = {
            name: data.name.trim(),
            email: data.email.trim(),
            mobile: data.mobile.trim(),
            password: hashedPassword,
            role: targetRole,
            status: "ACTIVE",
            fatherHusbandName: data.fatherHusbandName || null,
            address: data.address || null,
            idProofType: data.idProofType || "PAN Card",
            idProofNumber: data.idProofNumber || null,
            emergencyContact: data.emergencyContact || null,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date().toISOString().slice(0, 10),
        };
        // Insert directly into unified `users` table
        const result = await index_js_1.db.insert(index_js_2.users).values(values);
        const newId = result[0].insertId;
        // Record audit log
        if (creatorId) {
            await index_js_1.db.insert(index_js_2.auditLogs).values({
                userId: creatorId,
                action: `CREATE_${targetRole}`,
                module: "STAFF",
                recordId: newId,
                newData: JSON.stringify({ name: data.name, email: data.email, role: targetRole }),
            });
        }
        return this.getStaffMemberById(newId);
    }
    /**
     * Update a Staff Member directly in `users` table
     */
    static async updateAccountant(id, data, updaterId) {
        const existing = await index_js_1.db
            .select()
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.users.id, id), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)))
            .limit(1);
        if (existing.length === 0) {
            throw new Error("Staff member not found");
        }
        // Check unique email/mobile if changing
        if (data.email || data.mobile) {
            const conflict = await index_js_1.db
                .select()
                .from(index_js_2.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)(data.email ? (0, drizzle_orm_1.eq)(index_js_2.users.email, data.email.trim()) : undefined, data.mobile ? (0, drizzle_orm_1.eq)(index_js_2.users.mobile, data.mobile.trim()) : undefined), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)));
            const realConflict = conflict.find((u) => u.id !== id);
            if (realConflict) {
                throw new Error("Email or mobile already in use by another user");
            }
        }
        const updatePayload = {
            updatedAt: new Date(),
        };
        if (data.name)
            updatePayload.name = data.name.trim();
        if (data.email)
            updatePayload.email = data.email.trim();
        if (data.mobile)
            updatePayload.mobile = data.mobile.trim();
        if (data.role && (data.role === "ACCOUNTANT" || data.role === "SECRETARY")) {
            updatePayload.role = data.role;
        }
        if (data.status)
            updatePayload.status = data.status;
        if (data.fatherHusbandName !== undefined)
            updatePayload.fatherHusbandName = data.fatherHusbandName;
        if (data.address !== undefined)
            updatePayload.address = data.address;
        if (data.idProofType !== undefined)
            updatePayload.idProofType = data.idProofType;
        if (data.idProofNumber !== undefined)
            updatePayload.idProofNumber = data.idProofNumber;
        if (data.emergencyContact !== undefined)
            updatePayload.emergencyContact = data.emergencyContact;
        if (data.password && data.password.trim().length >= 6) {
            updatePayload.password = await (0, hash_js_1.hashPassword)(data.password.trim());
        }
        await index_js_1.db.update(index_js_2.users).set(updatePayload).where((0, drizzle_orm_1.eq)(index_js_2.users.id, id));
        if (updaterId) {
            await index_js_1.db.insert(index_js_2.auditLogs).values({
                userId: updaterId,
                action: "UPDATE_ACCOUNTANT",
                module: "STAFF",
                recordId: id,
                newData: JSON.stringify(updatePayload),
            });
        }
        return this.getStaffMemberById(id);
    }
    /**
     * Change or Assign Secretary
     * Directly on `users` table
     */
    static async changeSecretary(data, operatorId) {
        const mode = data.mode || "UPDATE";
        if (mode === "REPLACE_NEW") {
            // 1. Check if email/mobile is taken
            const existing = await index_js_1.db
                .select()
                .from(index_js_2.users)
                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_2.users.email, data.email.trim()), (0, drizzle_orm_1.eq)(index_js_2.users.mobile, data.mobile.trim())))
                .limit(1);
            if (existing.length > 0) {
                throw new Error("A user with this email or mobile number already exists.");
            }
            // 2. Deactivate previous active secretaries
            await index_js_1.db
                .update(index_js_2.users)
                .set({ status: "INACTIVE", updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(index_js_2.users.role, "SECRETARY"));
            // 3. Create new active Secretary
            const rawPass = data.password ? data.password.trim() : "Secretary@123";
            const hashedPassword = await (0, hash_js_1.hashPassword)(rawPass);
            const secValues = {
                name: data.name.trim(),
                email: data.email.trim(),
                mobile: data.mobile.trim(),
                password: hashedPassword,
                role: "SECRETARY",
                status: "ACTIVE",
                fatherHusbandName: data.fatherHusbandName || null,
                address: data.address || null,
                idProofType: data.idProofType || "Aadhaar Card",
                idProofNumber: data.idProofNumber || null,
                emergencyContact: data.emergencyContact || null,
                joiningDate: new Date().toISOString().slice(0, 10),
            };
            const result = await index_js_1.db.insert(index_js_2.users).values(secValues);
            const newId = result[0].insertId;
            if (operatorId) {
                await index_js_1.db.insert(index_js_2.auditLogs).values({
                    userId: operatorId,
                    action: "CHANGE_SECRETARY_NEW",
                    module: "STAFF",
                    recordId: newId,
                    newData: JSON.stringify({ name: data.name, email: data.email, role: "SECRETARY" }),
                });
            }
            return this.getStaffMemberById(newId);
        }
        else {
            // UPDATE mode: Target specific ID or first active secretary
            let targetId = data.id;
            if (!targetId) {
                const activeSec = await index_js_1.db
                    .select()
                    .from(index_js_2.users)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.users.role, "SECRETARY"), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)))
                    .limit(1);
                if (activeSec.length > 0) {
                    targetId = activeSec[0].id;
                }
            }
            if (!targetId) {
                // No existing secretary, fallback to creating one
                return this.changeSecretary({ ...data, mode: "REPLACE_NEW" }, operatorId);
            }
            // Check unique email/mobile
            const conflict = await index_js_1.db
                .select()
                .from(index_js_2.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)(data.email ? (0, drizzle_orm_1.eq)(index_js_2.users.email, data.email.trim()) : undefined, data.mobile ? (0, drizzle_orm_1.eq)(index_js_2.users.mobile, data.mobile.trim()) : undefined), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)));
            const realConflict = conflict.find((u) => u.id !== targetId);
            if (realConflict) {
                throw new Error("Email or mobile is already in use by another user");
            }
            const updatePayload = {
                name: data.name.trim(),
                email: data.email.trim(),
                mobile: data.mobile.trim(),
                status: "ACTIVE",
                updatedAt: new Date(),
            };
            if (data.fatherHusbandName !== undefined)
                updatePayload.fatherHusbandName = data.fatherHusbandName;
            if (data.address !== undefined)
                updatePayload.address = data.address;
            if (data.idProofType !== undefined)
                updatePayload.idProofType = data.idProofType;
            if (data.idProofNumber !== undefined)
                updatePayload.idProofNumber = data.idProofNumber;
            if (data.emergencyContact !== undefined)
                updatePayload.emergencyContact = data.emergencyContact;
            if (data.password && data.password.trim().length >= 6) {
                updatePayload.password = await (0, hash_js_1.hashPassword)(data.password.trim());
            }
            await index_js_1.db.update(index_js_2.users).set(updatePayload).where((0, drizzle_orm_1.eq)(index_js_2.users.id, targetId));
            if (operatorId) {
                await index_js_1.db.insert(index_js_2.auditLogs).values({
                    userId: operatorId,
                    action: "UPDATE_SECRETARY",
                    module: "STAFF",
                    recordId: targetId,
                    newData: JSON.stringify(updatePayload),
                });
            }
            return this.getStaffMemberById(targetId);
        }
    }
    /**
     * Deactivate a Staff Member in `users` table
     */
    static async deleteStaff(id, operatorId) {
        if (id === operatorId) {
            throw new Error("You cannot deactivate or delete your own logged-in account.");
        }
        const target = await index_js_1.db
            .select()
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.users.id, id), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)))
            .limit(1);
        if (target.length === 0) {
            throw new Error("Staff member not found");
        }
        if (target[0].role === "ACCOUNTANT") {
            // Ensure at least one other active accountant exists
            const otherAccountants = await index_js_1.db
                .select()
                .from(index_js_2.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_2.users.role, "ACCOUNTANT"), (0, drizzle_orm_1.eq)(index_js_2.users.status, "ACTIVE"), (0, drizzle_orm_1.isNull)(index_js_2.users.deletedAt)));
            const remaining = otherAccountants.filter((a) => a.id !== id);
            if (remaining.length === 0) {
                throw new Error("Cannot deactivate the only active accountant in the system.");
            }
        }
        await index_js_1.db
            .update(index_js_2.users)
            .set({ status: "INACTIVE", deletedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(index_js_2.users.id, id));
        await index_js_1.db.insert(index_js_2.auditLogs).values({
            userId: operatorId,
            action: "DEACTIVATE_STAFF",
            module: "STAFF",
            recordId: id,
            oldData: JSON.stringify({ name: target[0].name, role: target[0].role }),
        });
        return { success: true, message: `Staff member deactivated successfully.` };
    }
    /**
     * Helper to fetch a staff user without password directly from `users`
     */
    static async getStaffMemberById(id) {
        const userRecords = await index_js_1.db
            .select({
            id: index_js_2.users.id,
            name: index_js_2.users.name,
            email: index_js_2.users.email,
            mobile: index_js_2.users.mobile,
            role: index_js_2.users.role,
            status: index_js_2.users.status,
            fatherHusbandName: index_js_2.users.fatherHusbandName,
            address: index_js_2.users.address,
            idProofType: index_js_2.users.idProofType,
            idProofNumber: index_js_2.users.idProofNumber,
            emergencyContact: index_js_2.users.emergencyContact,
            createdAt: index_js_2.users.createdAt,
            updatedAt: index_js_2.users.updatedAt,
        })
            .from(index_js_2.users)
            .where((0, drizzle_orm_1.eq)(index_js_2.users.id, id))
            .limit(1);
        return userRecords[0] || null;
    }
}
exports.StaffService = StaffService;
