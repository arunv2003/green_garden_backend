import { eq, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { societies, blocks, floors, flats } from "../../db/schema/index.js";

export class SocietyService {
  static async getSocietyInfo() {
    const list = await db.select().from(societies).limit(1);
    if (list.length === 0) {
      throw new Error("Society record not found");
    }
    const blocksList = await this.getAllBlocks();
    return {
      ...list[0],
      blocks: blocksList,
    };
  }

  static async updateSocietyInfo(data: any) {
    const info = await this.getSocietyInfo();
    await db.update(societies).set({ ...data, updatedAt: new Date() }).where(eq(societies.id, info.id));
    return this.getSocietyInfo();
  }

  static async getAllBlocks() {
    const allBlocks = await db.select().from(blocks).orderBy(blocks.name);
    // Count flats in each block
    const allFlats = await db.select().from(flats);
    return allBlocks.map((b) => {
      const blockFlats = allFlats.filter((f) => f.blockId === b.id);
      return {
        ...b,
        blockCode: b.code,
        totalFloors: b.numberOfFloors,
        totalFlats: blockFlats.length,
        occupiedFlats: blockFlats.filter((f) => f.occupancyStatus === "OCCUPIED").length,
        vacantFlats: blockFlats.filter((f) => f.occupancyStatus === "VACANT").length,
      };
    });
  }

  static async createBlock(data: any) {
    const info = await this.getSocietyInfo();
    const code = String(data.code || data.blockCode || "").trim().toUpperCase();
    const numberOfFloors = Number(data.numberOfFloors || data.totalFloors || 5);
    const res = await db.insert(blocks).values({
      societyId: info.id,
      name: data.name.trim(),
      code,
      numberOfFloors,
      status: "ACTIVE",
    });
    const blockId = res[0].insertId;

    // Auto-create floors for this block
    for (let f = 1; f <= numberOfFloors; f++) {
      const name = f === 1 ? "1st Floor" : f === 2 ? "2nd Floor" : f === 3 ? "3rd Floor" : `${f}th Floor`;
      await db.insert(floors).values({
        blockId,
        floorNumber: f,
        name,
        status: "ACTIVE",
      });
    }

    return {
      id: blockId,
      ...data,
      code,
      blockCode: code,
      numberOfFloors,
      totalFloors: numberOfFloors,
    };
  }

  static async updateBlock(id: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = String(data.name).trim();
    if (data.code !== undefined || data.blockCode !== undefined) {
      updateData.code = String(data.code || data.blockCode).trim().toUpperCase();
    }
    if (data.numberOfFloors !== undefined || data.totalFloors !== undefined) {
      updateData.numberOfFloors = Number(data.numberOfFloors || data.totalFloors);
    }
    if (data.status !== undefined) updateData.status = data.status;

    await db.update(blocks).set({ ...updateData, updatedAt: new Date() }).where(eq(blocks.id, id));
    const updated = await db.select().from(blocks).where(eq(blocks.id, id)).limit(1);
    if (!updated.length) throw new Error("Block not found");
    return {
      ...updated[0],
      blockCode: updated[0].code,
      totalFloors: updated[0].numberOfFloors,
    };
  }

  static async deleteBlock(id: number) {
    // Check if flats exist in this block
    const existingFlats = await db.select().from(flats).where(eq(flats.blockId, id)).limit(1);
    if (existingFlats.length > 0) {
      throw new Error("Cannot delete Tower/Block that contains registered flats. Reassign or delete flats first.");
    }
    await db.update(blocks).set({ status: "INACTIVE" }).where(eq(blocks.id, id));
    return { success: true, message: "Block deactivated successfully" };
  }

  static async getFloors(blockId?: number) {
    if (blockId) {
      return db.select().from(floors).where(eq(floors.blockId, blockId)).orderBy(floors.floorNumber);
    }
    return db.select().from(floors).orderBy(floors.floorNumber);
  }

  static async createFloor(data: any) {
    const res = await db.insert(floors).values({
      blockId: data.blockId,
      floorNumber: data.floorNumber,
      name: data.name.trim(),
      status: "ACTIVE",
    });
    return { id: res[0].insertId, ...data };
  }
}
