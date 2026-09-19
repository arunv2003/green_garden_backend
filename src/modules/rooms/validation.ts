import { z } from "zod";

export const ROOM_TYPES = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "Penthouse",
  "Studio",
  "Shop / Commercial",
  "Other",
] as const;

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  floor: z.coerce.number().int().min(0, "Floor must be 0 or higher"),
  roomType: z.enum(ROOM_TYPES).default("1 BHK"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  monthlyRent: z.coerce.number().positive("Monthly rent must be positive"),
  securityDeposit: z.coerce.number().min(0).default(0),
  description: z.string().optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "PARTIALLY_OCCUPIED", "MAINTENANCE", "INACTIVE"]).default("AVAILABLE"),
});

export const updateRoomSchema = createRoomSchema.partial();
