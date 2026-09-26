import { eq } from "drizzle-orm";
import { db, poolConnection } from "./index.js";
import { users } from "../modules/guests/guests.schema.js";
import { societies, blocks, floors } from "../modules/society/society.schema.js";
import { flats } from "../modules/flats/flats.schema.js";
import { residents } from "../modules/residents/residents.schema.js";
import { hashPassword } from "../utils/hash.js";

async function runSeed() {
  console.log("🌱 Starting Green Garden TiDB Database Seeding...");

  try {
    // 1. Create or get Society
    let existingSocieties = await db.select().from(societies).limit(1);
    let societyId: number;

    if (existingSocieties.length === 0) {
      const [socRes] = await db.insert(societies).values({
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
    } else {
      societyId = existingSocieties[0].id;
      console.log(`ℹ️ Society already exists (ID: ${societyId})`);
    }

    // 2. Create Block
    let existingBlocks = await db.select().from(blocks).limit(1);
    let blockId: number;

    if (existingBlocks.length === 0) {
      const [blockRes] = await db.insert(blocks).values({
        societyId,
        name: "Tower A",
        code: "TWA",
        numberOfFloors: 5,
        status: "ACTIVE",
      });
      blockId = blockRes.insertId;
      console.log(`✅ Block created (ID: ${blockId})`);
    } else {
      blockId = existingBlocks[0].id;
    }

    // 3. Create Floor
    let existingFloors = await db.select().from(floors).limit(1);
    let floorId: number;

    if (existingFloors.length === 0) {
      const [floorRes] = await db.insert(floors).values({
        blockId,
        floorNumber: 1,
        name: "1st Floor",
        status: "ACTIVE",
      });
      floorId = floorRes.insertId;
      console.log(`✅ Floor created (ID: ${floorId})`);
    } else {
      floorId = existingFloors[0].id;
    }

    // 4. Create Flats
    const flatNumbers = ["101", "102", "103", "104", "201", "202"];
    const createdFlats: { id: number; flatNumber: string }[] = [];

    for (const flatNum of flatNumbers) {
      const existing = await db.select().from(flats).where(eq(flats.flatNumber, flatNum)).limit(1);
      if (existing.length === 0) {
        const [flatRes] = await db.insert(flats).values({
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
      } else {
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
        role: "SECRETARY" as const,
      },
      {
        name: "Rajesh Sharma",
        email: "accountant@greengarden.com",
        mobile: "9876543211",
        passwordPlain: "Accountant@123",
        role: "ACCOUNTANT" as const,
      },
      {
        name: "Rahul Sharma",
        email: "rahul@gmail.com",
        mobile: "9876543212",
        passwordPlain: "User@123",
        role: "USER" as const,
      },
      {
        name: "Priya Patel",
        email: "priya@gmail.com",
        mobile: "9876543213",
        passwordPlain: "User@123",
        role: "USER" as const,
      },
      {
        name: "Amit Kumar",
        email: "amit@gmail.com",
        mobile: "9876543214",
        passwordPlain: "User@123",
        role: "USER" as const,
      },
    ];

    for (const u of defaultUsers) {
      const existingUser = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
      if (existingUser.length === 0) {
        const hashedPassword = await hashPassword(u.passwordPlain);
        const [userRes] = await db.insert(users).values({
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
            await db.insert(residents).values({
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
      } else {
        console.log(`ℹ️ User already exists: ${u.email}`);
      }
    }

    console.log("\n🎉 Database seeded successfully into TiDB Cloud!");
  } catch (err: any) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await poolConnection.end();
    process.exit(0);
  }
}

runSeed();
