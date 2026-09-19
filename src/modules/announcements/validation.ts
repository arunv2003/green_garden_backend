import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  attachmentUrl: z.string().optional(),
  publishDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  expiryDate: z.string().optional(),
});
