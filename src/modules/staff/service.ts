import { eq, and, isNull, or, desc, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users, auditLogs } from "../../db/schema/index.js";
import { hashPassword } from "../../utils/hash.js";

export class StaffService {
  /**
   * Get all accountants and secretaries, identifying active secretary
   * Directly from the unified `users` table
   */
  static async getStaffOverview(filters?: { search?: string; role?: string; page?: number; limit?: number }) {
    // 1. Fetch all Staff members (Accountants & Secretaries) from `users` table
    const allStaffMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        mobile: users.mobile,
        role: users.role,
        status: users.status,
        fatherHusbandName: users.fatherHusbandName,
        address: users.address,
        idProofType: users.idProofType,
        idProofNumber: users.idProofNumber,
        emergencyContact: users.emergencyContact,
        joiningDate: users.joiningDate,
        profilePhoto: users.profilePhoto,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(
        and(
          inArray(users.role, ["SECRETARY", "ACCOUNTANT"]),
          isNull(users.deletedAt)
        )
      )
      .orderBy(desc(users.createdAt));

    // 2. Identify Secretaries and active Secretary
    const secretaries = allStaffMembers.filter((s) => s.role === "SECRETARY");
    const activeSecretary = secretaries.find((s) => s.status === "ACTIVE") || secretaries[0] || null;

    let filteredStaff = allStaffMembers;

    if (filters?.role && filters.role !== "ALL") {
      filteredStaff = filteredStaff.filter((s) => s.role === filters.role);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      filteredStaff = filteredStaff.filter(
        (acc) =>
          acc.name.toLowerCase().includes(q) ||
          acc.email.toLowerCase().includes(q) ||
          acc.mobile.includes(q) ||
          acc.role.toLowerCase().includes(q) ||
          (acc.address && acc.address.toLowerCase().includes(q)) ||
          (acc.idProofNumber && acc.idProofNumber.toLowerCase().includes(q))
      );
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
  static async createAccountant(data: any, creatorId?: number) {
    const existing = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, data.email.trim()),
          eq(users.mobile, data.mobile.trim())
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("A user with this email or mobile number already exists.");
    }

    const targetRole = (data.role === "SECRETARY" ? "SECRETARY" : "ACCOUNTANT") as "ACCOUNTANT" | "SECRETARY";
    const defaultPass = data.password && data.password.trim().length >= 6
      ? data.password.trim()
      : (targetRole === "SECRETARY" ? "Secretary@123" : "Accountant@123");
    const hashedPassword = await hashPassword(defaultPass);

    const values = {
      name: data.name.trim(),
      email: data.email.trim(),
      mobile: data.mobile.trim(),
      password: hashedPassword,
      role: targetRole,
      status: "ACTIVE" as const,
      fatherHusbandName: data.fatherHusbandName || null,
      address: data.address || null,
      idProofType: data.idProofType || "PAN Card",
      idProofNumber: data.idProofNumber || null,
      emergencyContact: data.emergencyContact || null,
      joiningDate: data.joiningDate ? (new Date(data.joiningDate) as any) : (new Date().toISOString().slice(0, 10) as any),
    };

    // Insert directly into unified `users` table
    const result = await db.insert(users).values(values);
    const newId = result[0].insertId;

    // Record audit log
    if (creatorId) {
      await db.insert(auditLogs).values({
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
  static async updateAccountant(id: number, data: any, updaterId?: number) {
    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Staff member not found");
    }

    // Check unique email/mobile if changing
    if (data.email || data.mobile) {
      const conflict = await db
        .select()
        .from(users)
        .where(
          and(
            or(
              data.email ? eq(users.email, data.email.trim()) : undefined,
              data.mobile ? eq(users.mobile, data.mobile.trim()) : undefined
            ),
            isNull(users.deletedAt)
          )
        );

      const realConflict = conflict.find((u) => u.id !== id);
      if (realConflict) {
        throw new Error("Email or mobile already in use by another user");
      }
    }

    const updatePayload: any = {
      updatedAt: new Date(),
    };

    if (data.name) updatePayload.name = data.name.trim();
    if (data.email) updatePayload.email = data.email.trim();
    if (data.mobile) updatePayload.mobile = data.mobile.trim();
    if (data.role && (data.role === "ACCOUNTANT" || data.role === "SECRETARY")) {
      updatePayload.role = data.role;
    }
    if (data.status) updatePayload.status = data.status;
    if (data.fatherHusbandName !== undefined) updatePayload.fatherHusbandName = data.fatherHusbandName;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.idProofType !== undefined) updatePayload.idProofType = data.idProofType;
    if (data.idProofNumber !== undefined) updatePayload.idProofNumber = data.idProofNumber;
    if (data.emergencyContact !== undefined) updatePayload.emergencyContact = data.emergencyContact;

    if (data.password && data.password.trim().length >= 6) {
      updatePayload.password = await hashPassword(data.password.trim());
    }

    await db.update(users).set(updatePayload).where(eq(users.id, id));

    if (updaterId) {
      await db.insert(auditLogs).values({
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
  static async changeSecretary(data: any, operatorId?: number): Promise<any> {
    const mode = data.mode || "UPDATE";

    if (mode === "REPLACE_NEW") {
      // 1. Check if email/mobile is taken
      const existing = await db
        .select()
        .from(users)
        .where(
          or(
            eq(users.email, data.email.trim()),
            eq(users.mobile, data.mobile.trim())
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error("A user with this email or mobile number already exists.");
      }

      // 2. Deactivate previous active secretaries
      await db
        .update(users)
        .set({ status: "INACTIVE", updatedAt: new Date() })
        .where(eq(users.role, "SECRETARY"));

      // 3. Create new active Secretary
      const rawPass = data.password ? data.password.trim() : "Secretary@123";
      const hashedPassword = await hashPassword(rawPass);

      const secValues = {
        name: data.name.trim(),
        email: data.email.trim(),
        mobile: data.mobile.trim(),
        password: hashedPassword,
        role: "SECRETARY" as const,
        status: "ACTIVE" as const,
        fatherHusbandName: data.fatherHusbandName || null,
        address: data.address || null,
        idProofType: data.idProofType || "Aadhaar Card",
        idProofNumber: data.idProofNumber || null,
        emergencyContact: data.emergencyContact || null,
        joiningDate: (new Date().toISOString().slice(0, 10) as any),
      };

      const result = await db.insert(users).values(secValues);
      const newId = result[0].insertId;

      if (operatorId) {
        await db.insert(auditLogs).values({
          userId: operatorId,
          action: "CHANGE_SECRETARY_NEW",
          module: "STAFF",
          recordId: newId,
          newData: JSON.stringify({ name: data.name, email: data.email, role: "SECRETARY" }),
        });
      }

      return this.getStaffMemberById(newId);
    } else {
      // UPDATE mode: Target specific ID or first active secretary
      let targetId = data.id;

      if (!targetId) {
        const activeSec = await db
          .select()
          .from(users)
          .where(and(eq(users.role, "SECRETARY"), isNull(users.deletedAt)))
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
      const conflict = await db
        .select()
        .from(users)
        .where(
          and(
            or(
              data.email ? eq(users.email, data.email.trim()) : undefined,
              data.mobile ? eq(users.mobile, data.mobile.trim()) : undefined
            ),
            isNull(users.deletedAt)
          )
        );

      const realConflict = conflict.find((u) => u.id !== targetId);
      if (realConflict) {
        throw new Error("Email or mobile is already in use by another user");
      }

      const updatePayload: any = {
        name: data.name.trim(),
        email: data.email.trim(),
        mobile: data.mobile.trim(),
        status: "ACTIVE" as const,
        updatedAt: new Date(),
      };

      if (data.fatherHusbandName !== undefined) updatePayload.fatherHusbandName = data.fatherHusbandName;
      if (data.address !== undefined) updatePayload.address = data.address;
      if (data.idProofType !== undefined) updatePayload.idProofType = data.idProofType;
      if (data.idProofNumber !== undefined) updatePayload.idProofNumber = data.idProofNumber;
      if (data.emergencyContact !== undefined) updatePayload.emergencyContact = data.emergencyContact;

      if (data.password && data.password.trim().length >= 6) {
        updatePayload.password = await hashPassword(data.password.trim());
      }

      await db.update(users).set(updatePayload).where(eq(users.id, targetId));

      if (operatorId) {
        await db.insert(auditLogs).values({
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
  static async deleteStaff(id: number, operatorId: number) {
    if (id === operatorId) {
      throw new Error("You cannot deactivate or delete your own logged-in account.");
    }

    const target = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    if (target.length === 0) {
      throw new Error("Staff member not found");
    }

    if (target[0].role === "ACCOUNTANT") {
      // Ensure at least one other active accountant exists
      const otherAccountants = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, "ACCOUNTANT"),
            eq(users.status, "ACTIVE"),
            isNull(users.deletedAt)
          )
        );

      const remaining = otherAccountants.filter((a) => a.id !== id);
      if (remaining.length === 0) {
        throw new Error("Cannot deactivate the only active accountant in the system.");
      }
    }

    await db
      .update(users)
      .set({ status: "INACTIVE", deletedAt: new Date() })
      .where(eq(users.id, id));

    await db.insert(auditLogs).values({
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
  static async getStaffMemberById(id: number) {
    const userRecords = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        mobile: users.mobile,
        role: users.role,
        status: users.status,
        fatherHusbandName: users.fatherHusbandName,
        address: users.address,
        idProofType: users.idProofType,
        idProofNumber: users.idProofNumber,
        emergencyContact: users.emergencyContact,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return userRecords[0] || null;
  }
}
