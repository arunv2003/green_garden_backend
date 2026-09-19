"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocietyService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../db/index.js");
const index_js_2 = require("../../db/schema/index.js");
class SocietyService {
    static async getSocietyInfo() {
        const list = await index_js_1.db.select().from(index_js_2.societies).limit(1);
        if (list.length === 0) {
            throw new Error("Society record not found");
        }
        const blocksList = await this.getAllBlocks();
        return {
            ...list[0],
            blocks: blocksList,
        };
    }
    static async updateSocietyInfo(data) {
        const info = await this.getSocietyInfo();
        await index_js_1.db.update(index_js_2.societies).set({ ...data, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_2.societies.id, info.id));
        return this.getSocietyInfo();
    }
    static async getAllBlocks() {
        const allBlocks = await index_js_1.db.select().from(index_js_2.blocks).orderBy(index_js_2.blocks.name);
        // Count flats in each block
        const allFlats = await index_js_1.db.select().from(index_js_2.flats);
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
    static async createBlock(data) {
        const info = await this.getSocietyInfo();
        const code = String(data.code || data.blockCode || "").trim().toUpperCase();
        const numberOfFloors = Number(data.numberOfFloors || data.totalFloors || 5);
        const res = await index_js_1.db.insert(index_js_2.blocks).values({
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
            await index_js_1.db.insert(index_js_2.floors).values({
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
    static async updateBlock(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = String(data.name).trim();
        if (data.code !== undefined || data.blockCode !== undefined) {
            updateData.code = String(data.code || data.blockCode).trim().toUpperCase();
        }
        if (data.numberOfFloors !== undefined || data.totalFloors !== undefined) {
            updateData.numberOfFloors = Number(data.numberOfFloors || data.totalFloors);
        }
        if (data.status !== undefined)
            updateData.status = data.status;
        await index_js_1.db.update(index_js_2.blocks).set({ ...updateData, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_2.blocks.id, id));
        const updated = await index_js_1.db.select().from(index_js_2.blocks).where((0, drizzle_orm_1.eq)(index_js_2.blocks.id, id)).limit(1);
        if (!updated.length)
            throw new Error("Block not found");
        return {
            ...updated[0],
            blockCode: updated[0].code,
            totalFloors: updated[0].numberOfFloors,
        };
    }
    static async deleteBlock(id) {
        // Check if flats exist in this block
        const existingFlats = await index_js_1.db.select().from(index_js_2.flats).where((0, drizzle_orm_1.eq)(index_js_2.flats.blockId, id)).limit(1);
        if (existingFlats.length > 0) {
            throw new Error("Cannot delete Tower/Block that contains registered flats. Reassign or delete flats first.");
        }
        await index_js_1.db.update(index_js_2.blocks).set({ status: "INACTIVE" }).where((0, drizzle_orm_1.eq)(index_js_2.blocks.id, id));
        return { success: true, message: "Block deactivated successfully" };
    }
    static async getFloors(blockId) {
        if (blockId) {
            return index_js_1.db.select().from(index_js_2.floors).where((0, drizzle_orm_1.eq)(index_js_2.floors.blockId, blockId)).orderBy(index_js_2.floors.floorNumber);
        }
        return index_js_1.db.select().from(index_js_2.floors).orderBy(index_js_2.floors.floorNumber);
    }
    static async createFloor(data) {
        const res = await index_js_1.db.insert(index_js_2.floors).values({
            blockId: data.blockId,
            floorNumber: data.floorNumber,
            name: data.name.trim(),
            status: "ACTIVE",
        });
        return { id: res[0].insertId, ...data };
    }
}
exports.SocietyService = SocietyService;
