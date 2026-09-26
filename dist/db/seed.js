"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("./index.js");
const guests_schema_js_1 = require("../modules/guests/guests.schema.js");
const society_schema_js_1 = require("../modules/society/society.schema.js");
const flats_schema_js_1 = require("../modules/flats/flats.schema.js");
const residents_schema_js_1 = require("../modules/residents/residents.schema.js");
const hash_js_1 = require("../utils/hash.js");
async function runSeed() {
    console.log("🌱 Starting Green Garden TiDB Database Seeding...");
    try {
        // 1. Create or get Society
        let existingSocieties = await index_js_1.db.select().from(society_schema_js_1.societies).limit(1);
        let societyId;
        if (existingSocieties.length === 0) {
            const [socRes] = await index_js_1.db.insert(society_schema_js_1.societies).values({
                name: "Green Garden Residential Society",
                registrationNumber: "GG-REG-2026-4421",
                address: "Green Garden Enclave, Sector 45",
                city: "Gurugram",
                state: "Haryana",
                pincode: "122003",
                email: "office@greengarden.com",
                phone: "9876543210",
                maintenanceDueDay: 10,
                lateFee: "200.00",
                status: "ACTIVE",
            });
            societyId = socRes.insertId;
            console.log(`✅ Society created (ID: ${societyId})`);
        }
        else {
            societyId = existingSocieties[0].id;
            console.log(`ℹ️ Society already exists (ID: ${societyId})`);
        }
        // 2. Create Block
        let existingBlocks = await index_js_1.db.select().from(society_schema_js_1.blocks).limit(1);
        let blockId;
        if (existingBlocks.length === 0) {
            const [blockRes] = await index_js_1.db.insert(society_schema_js_1.blocks).values({
                societyId,
                name: "Tower A",
                code: "TWA",
                numberOfFloors: 5,
                status: "ACTIVE",
            });
            blockId = blockRes.insertId;
            console.log(`✅ Block created (ID: ${blockId})`);
        }
        else {
            blockId = existingBlocks[0].id;
        }
        // 3. Create Floor
        let existingFloors = await index_js_1.db.select().from(society_schema_js_1.floors).limit(1);
        let floorId;
        if (existingFloors.length === 0) {
            const [floorRes] = await index_js_1.db.insert(society_schema_js_1.floors).values({
                blockId,
                floorNumber: 1,
                name: "1st Floor",
                status: "ACTIVE",
            });
            floorId = floorRes.insertId;
            console.log(`✅ Floor created (ID: ${floorId})`);
        }
        else {
            floorId = existingFloors[0].id;
        }
        // 4. Create Flats
        const flatNumbers = ["101", "102", "103", "104", "201", "202"];
        const createdFlats = [];
        for (const flatNum of flatNumbers) {
            const existing = await index_js_1.db.select().from(flats_schema_js_1.flats).where((0, drizzle_orm_1.eq)(flats_schema_js_1.flats.flatNumber, flatNum)).limit(1);
            if (existing.length === 0) {
                const [flatRes] = await index_js_1.db.insert(flats_schema_js_1.flats).values({
                    societyId,
                    blockId,
                    floorId,
                    flatNumber: flatNum,
                    flatType: "2BHK",
                    areaSqft: "1250.00",
                    bedrooms: 2,
                    bathrooms: 2,
                    occupancyStatus: "OCCUPIED",
                    ownershipStatus: "OWNER_OCCUPIED",
                    monthlyMaintenance: "3000.00",
                });
                createdFlats.push({ id: flatRes.insertId, flatNumber: flatNum });
            }
            else {
                createdFlats.push({ id: existing[0].id, flatNumber: existing[0].flatNumber });
            }
        }
        console.log(`✅ Flats verified/created: ${flatNumbers.join(", ")}`);
        // 5. Create Default Users
        const defaultUsers = [
            {
                name: "Sunita Verma",
                email: "secretary@greengarden.com",
                mobile: "9876543210",
                passwordPlain: "Secretary@123",
                role: "SECRETARY",
            },
            {
                name: "Rajesh Sharma",
                email: "accountant@greengarden.com",
                mobile: "9876543211",
                passwordPlain: "Accountant@123",
                role: "ACCOUNTANT",
            },
            {
                name: "Rahul Sharma",
                email: "rahul@gmail.com",
                mobile: "9876543212",
                passwordPlain: "User@123",
                role: "USER",
            },
            {
                name: "Priya Patel",
                email: "priya@gmail.com",
                mobile: "9876543213",
                passwordPlain: "User@123",
                role: "USER",
            },
            {
                name: "Amit Kumar",
                email: "amit@gmail.com",
                mobile: "9876543214",
                passwordPlain: "User@123",
                role: "USER",
            },
        ];
        for (const u of defaultUsers) {
            const existingUser = await index_js_1.db.select().from(guests_schema_js_1.users).where((0, drizzle_orm_1.eq)(guests_schema_js_1.users.email, u.email)).limit(1);
            if (existingUser.length === 0) {
                const hashedPassword = await (0, hash_js_1.hashPassword)(u.passwordPlain);
                const [userRes] = await index_js_1.db.insert(guests_schema_js_1.users).values({
                    name: u.name,
                    email: u.email,
                    mobile: u.mobile,
                    password: hashedPassword,
                    role: u.role,
                    status: "ACTIVE",
                });
                console.log(`✅ User created: ${u.email} [${u.role}]`);
                // If USER role, associate with a flat as resident
                if (u.role === "USER" && createdFlats.length > 0) {
                    const assignedFlat = createdFlats.shift();
                    if (assignedFlat) {
                        await index_js_1.db.insert(residents_schema_js_1.residents).values({
                            userId: userRes.insertId,
                            flatId: assignedFlat.id,
                            fullName: u.name,
                            mobile: u.mobile,
                            email: u.email,
                            residentType: "OWNER",
                            moveInDate: "2026-01-01",
                            status: "ACTIVE",
                        });
                        console.log(`   Assigned to Flat ${assignedFlat.flatNumber}`);
                    }
                }
            }
            else {
                console.log(`ℹ️ User already exists: ${u.email}`);
            }
        }
        console.log("\n🎉 Database seeded successfully into TiDB Cloud!");
    }
    catch (err) {
        console.error("❌ Seeding failed:", err);
    }
    finally {
        await index_js_1.poolConnection.end();
        process.exit(0);
    }
}
runSeed();
