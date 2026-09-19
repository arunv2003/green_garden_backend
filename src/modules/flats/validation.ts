import { z } from "zod";
import { FLAT_TYPES } from "./flats.schema.js";

export const createFlatSchema = z.object({
  societyId: z.number().default(1),
  blockId: z.number({ required_error: "Block/Tower selection is required" }),
  floorId: z.number({ required_error: "Floor selection is required" }),
  flatNumber: z.string().min(1, "Flat number is required"),
  flatType: z.enum(FLAT_TYPES).default("2BHK"),
  areaSqft: z.number().min(100).default(1200),
  bedrooms: z.number().min(1).default(2),
  bathrooms: z.number().min(1).default(2),
  monthlyMaintenance: z.number().min(0).default(3000),
  occupancyStatus: z.enum(["VACANT", "OCCUPIED", "UNDER_MAINTENANCE"]).default("VACANT"),
  ownershipStatus: z.enum(["OWNER_OCCUPIED", "TENANT_OCCUPIED", "VACANT"]).default("VACANT"),
});

export const updateFlatSchema = createFlatSchema.partial();
